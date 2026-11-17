from domain.interfaces import UniqueizerInterface
from domain import entities
from domain.dto import FileDataDTO
import uuid, io, mimetypes
from PIL import Image, ImageFile, ImageEnhance, ImageFilter
from typing import TypeGuard
import logging
import random

def is_crop(op: entities.ImageOperation) -> TypeGuard[entities.Crop]:
    return op.type == entities.UniqueizationType.CROP

def is_resize(op: entities.ImageOperation) -> TypeGuard[entities.Resize]:
    return op.type == entities.UniqueizationType.RESIZE

def is_rotate(op: entities.ImageOperation) -> TypeGuard[entities.Rotate]:
    return op.type == entities.UniqueizationType.ROTATE

def is_transform(op: entities.ImageOperation) -> TypeGuard[entities.TransformOperation]:
    return op.type == entities.UniqueizationType.TRANSFORM

def is_transpose(op: entities.ImageOperation) -> TypeGuard[entities.TransposeOperation]:
    return op.type == entities.UniqueizationType.TRANSPOSE

def is_convert(op: entities.ImageOperation) -> TypeGuard[entities.ConvertOperation]:
    return op.type == entities.UniqueizationType.CONVERT

def is_enhance(op: entities.ImageOperation) -> TypeGuard[entities.EnhanceOperation]:
    return op.type == entities.UniqueizationType.ENHANCE

def is_simple_filter(op: entities.ImageOperation) -> TypeGuard[entities.SimpleFilterOperation]:
    return op.type == entities.UniqueizationType.SIMPLE_FILTER

def is_pixel_noise(op: entities.ImageOperation) -> TypeGuard[entities.PixelNoiseOperation]:
    return op.type == entities.UniqueizationType.PIXEL_NOISE


def save_file_to_io(img: ImageFile, mime: str) -> io.BytesIO:
    img_io = io.BytesIO()
    img_io.name = str(uuid.uuid4()) + mimetypes.guess_extension(mime)
    img.save(img_io)
    img_io.seek(0)
    return img_io

def calculate_average_color(img: ImageFile.ImageFile):
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Get the total number of pixels
    num_pixels = img.width * img.height

    # Get all pixel data as a list of (R, G, B) tuples
    pixels = list(img.getdata())

    # Sum all R, G, and B values
    r_sum = sum(p[0] for p in pixels)
    g_sum = sum(p[1] for p in pixels)
    b_sum = sum(p[2] for p in pixels)

    # Calculate the average color components
    avg_r = int(r_sum / num_pixels)
    avg_g = int(g_sum / num_pixels)
    avg_b = int(b_sum / num_pixels)

    # Create the average color tuple for Pillow
    average_color = (avg_r, avg_g, avg_b)
    return average_color

class PhotoUniquezer(UniqueizerInterface):

    def __init__(self, logger: logging.Logger):
        
        self._logger = logger

    async def uniqueze(self, file_data: FileDataDTO, settings: entities.UniqueizationSettings) -> FileDataDTO:
        try:
            img = Image.open(file_data.content)

            for setting in settings.settings:
                self._logger.info(f'APPLYING OPERATION: {setting.type} WITH SETTINGS: {setting}')
                if is_crop(setting):
                    width, height = img.size
                    img = img.crop((setting.left, setting.top, width - setting.right, height - setting.bottom))
                
                elif is_resize(setting):
                    img = img.resize(size=(setting.width, setting.height), resample=setting.resample)
                
                elif is_rotate(setting):
                    if setting.blurred_background:
                        if img.mode == 'P' or img.mode == 'LA' or img.mode == 'L':
                            img = img.convert('RGB')
                        img_blurred = img.filter(ImageFilter.GaussianBlur(setting.blurred_background_blur_radius))                        

                        img_fg_rotated = img.convert('RGBA')
                        img_fg_rotated = img_fg_rotated.rotate(
                            setting.angle,
                            resample=setting.resample,
                            expand=setting.expand,
                            center=setting.center,
                            fillcolor=(0, 0, 0, 0) # Fully transparent
                        )

                        new_width, new_height = img_fg_rotated.size

                        # Resize the blurred background image to match the rotated foreground's dimensions
                        # Use a high-quality resampling filter for the resize
                        img_blurred_resized = img_blurred.resize(
                            (new_width, new_height), 
                            Image.Resampling.LANCZOS # or Image.LANCZOS in older versions
                        )

                        # Paste the rotated foreground (img_fg_rotated) onto the resized blurred background 
                        # (img_blurred_resized). The mask argument ensures transparency is respected.
                        img_blurred_resized.paste(
                            img_fg_rotated, 
                            (0, 0), # Paste at the top-left corner (0, 0)
                            mask=img_fg_rotated # Use the rotated image itself as the mask
                        )

                        # The final image is now img_blurred_resized
                        img = img_blurred_resized                        
                    else:
                        if setting.fill_with_average_color:
                            setting.fillcolor = calculate_average_color(img)
                        img = img.rotate(setting.angle, resample=setting.resample, expand=setting.expand, center=setting.center, fillcolor=setting.fillcolor)

                elif is_transform(setting):
                    fill = hasattr(setting, "fillcolor")
                    img = img.transform(img.size, setting.method, setting.data, setting.resample, fill, setting.fillcolor)

                elif is_transpose(setting):
                    img = img.transpose(setting.transpose)

                elif is_convert(setting):
                    img = img.convert(setting.mode, setting.matrix, dither=setting.dither, palette=setting.palette, colors=setting.colors)
                    if setting.mode == 'CMYK':
                        file_data.mime = 'image/jpeg'
                    else:
                        file_data.mime = 'image/png'

                elif is_enhance(setting):
                    if setting.method == entities.EnhanceMethod.CONTRAST:
                        img = ImageEnhance.Contrast(img).enhance(setting.factor)
                    elif setting.method == entities.EnhanceMethod.BRIGHTNESS:
                        img = ImageEnhance.Brightness(img).enhance(setting.factor)
                    elif setting.method == entities.EnhanceMethod.SHARPNESS:
                        img = ImageEnhance.Sharpness(img).enhance(setting.factor)
                    elif setting.method == entities.EnhanceMethod.COLOR:
                        img = ImageEnhance.Color(img).enhance(setting.factor)

                # TODO: add complex filters
                elif is_simple_filter(setting):
                    if setting.method == entities.SimpleFilterMethod.CONTOUR:
                        img = img.filter(ImageFilter.CONTOUR)
                    elif setting.method == entities.SimpleFilterMethod.EDGE_ENHANCE:
                        img = img.filter(ImageFilter.EDGE_ENHANCE)
                    elif setting.method == entities.SimpleFilterMethod.EDGE_ENHANCE_MORE:
                        img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
                    elif setting.method == entities.SimpleFilterMethod.EMBOSS:
                        img = img.filter(ImageFilter.EMBOSS)
                    elif setting.method == entities.SimpleFilterMethod.FIND_EDGES:
                        img = img.filter(ImageFilter.FIND_EDGES)
                    elif setting.method == entities.SimpleFilterMethod.SHARPEN:
                        img = img.filter(ImageFilter.SHARPEN)
                    elif setting.method == entities.SimpleFilterMethod.SMOOTH:
                        img = img.filter(ImageFilter.SMOOTH)
                    elif setting.method == entities.SimpleFilterMethod.SMOOTH_MORE:
                        img = img.filter(ImageFilter.SMOOTH_MORE)
                
                elif is_pixel_noise(setting):
                    num_pixels_to_change = random.randint(setting.pixels_min, setting.pixels_max)
                    
                    current_width, current_height = img.size
                    
                    if img.mode == 'RGBA':
                        img_temp = img.convert('RGB') 
                        alpha = img.split()[-1] 
                    else:
                        img_temp = img.copy() 
                        alpha = None
                        
                    img_pixels = img_temp.load() 
                    
                    for _ in range(num_pixels_to_change):
                        if current_width > 0 and current_height > 0:
                            x = random.randint(0, current_width - 1)
                            y = random.randint(0, current_height - 1)
                            
                            # Случайный RGB шум
                            img_pixels[x, y] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                    
                    img = img_temp 
                    
                    if alpha: # Если был альфа-канал, восстанавливаем его
                        img.putalpha(alpha)

            return FileDataDTO(content=save_file_to_io(img, file_data.mime), mime=file_data.mime)
        except Exception as e:
            self._logger.error(e, exc_info=True)