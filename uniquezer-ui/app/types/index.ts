// PIL.Image.Resampling enum values (integers, not strings!)
export enum Resampling {
  NEAREST = 0,
  LANCZOS = 1,
  BILINEAR = 2,
  BICUBIC = 3,
  BOX = 4,
  HAMMING = 5
}

// PIL.Image.Transform enum values
export enum Transform {
  AFFINE = 0,
  EXTENT = 1,
  PERSPECTIVE = 2,
  QUAD = 3,
  MESH = 4
}

// PIL.Image.Transpose enum values
export enum Transpose {
  FLIP_LEFT_RIGHT = 0,
  FLIP_TOP_BOTTOM = 1,
  ROTATE_90 = 2,
  ROTATE_180 = 3,
  ROTATE_270 = 4,
  TRANSPOSE = 5,
  TRANSVERSE = 6
}

// PIL.Image.Dither enum values
export enum Dither {
  NONE = 0,
  ORDERED = 1,
  RASTERIZE = 2,
  FLOYDSTEINBERG = 3
}

// PIL.Image.Palette enum values (strings)
export enum PaletteMode {
  WEB = 'WEB',
  ADAPTIVE = 'ADAPTIVE'
}

// Uniquization operation types (strings)
export enum UniqueizationType {
  ROTATE = 'rotate',
  CROP = 'crop',
  RESIZE = 'resize',
  // TRANSFORM = 'transform',
  TRANSPOSE = 'transpose',
  // CONVERT = 'convert',
  ENHANCE = 'enhance',
  SIMPLE_FILTER = 'simple_filter'
}

// Enhance method types (strings)
export enum EnhanceMethod {
  BRIGHTNESS = 'brightness',
  CONTRAST = 'contrast',
  SHARPNESS = 'sharpness',
  COLOR = 'color'
}

// Simple filter method types (strings - exact match with backend)
export enum SimpleFilterMethod {
  BLUR = 'Blur',
  CONTOUR = 'Contour',
  DETAIL = 'Detail',
  EDGE_ENHANCE = 'Edge-enhancement',
  EDGE_ENHANCE_MORE = 'Edge-enhancement More',
  EMBOSS = 'Emboss',
  FIND_EDGES = 'Find Edges',
  SHARPEN = 'Sharpen',
  SMOOTH = 'Smooth',
  SMOOTH_MORE = 'Smooth More'
}

// Base operation interface
export interface ImageOperation {
  type: UniqueizationType
}

// Specific operation types (matching backend schemas exactly)
export interface RotateOperation extends ImageOperation {
  type: UniqueizationType.ROTATE
  angle: number
  expand?: boolean
  fillcolor?: [number, number, number] | null
  center?: [number, number] | null
  resample?: Resampling  // Integer enum, not string!
}

export interface CropOperation extends ImageOperation {
  type: UniqueizationType.CROP
  left: number
  top: number
  right: number
  bottom: number
}

export interface ResizeOperation extends ImageOperation {
  type: UniqueizationType.RESIZE
  width: number
  height: number
  resample?: Resampling  // Integer enum, not string!
}

export interface TransposeOperation extends ImageOperation {
  type: UniqueizationType.TRANSPOSE
  transpose: Transpose  // Integer enum
}

export interface TransformOperation extends ImageOperation {
  type: UniqueizationType.TRANSFORM
  method: Transform  // Integer enum
  data: any[]  // Tuple becomes array in JSON
  resample?: Resampling
  fillcolor?: [number, number, number] | null
}

export interface ConvertOperation extends ImageOperation {
  type: UniqueizationType.CONVERT
  mode?: string | null
  matrix?: number[] | null  // Tuple becomes array
  dither?: Dither | null  // Integer enum
  palette?: string  // String enum value like 'WEB'
  colors?: number
}

export interface EnhanceOperation extends ImageOperation {
  type: UniqueizationType.ENHANCE
  method: EnhanceMethod  // String enum
  factor: number
}

export interface SimpleFilterOperation extends ImageOperation {
  type: UniqueizationType.SIMPLE_FILTER
  method: SimpleFilterMethod  // String enum with exact backend values
}

// Union type for all operations
export type AnyImageOperation = 
  | RotateOperation 
  | CropOperation 
  | ResizeOperation 
  | TransposeOperation
  | TransformOperation
  | ConvertOperation
  | EnhanceOperation 
  | SimpleFilterOperation

// Settings wrapper (matches backend exactly)
export interface UniqueizationSettings {
  settings: AnyImageOperation[]
}

// Resampling options for UI
export interface ResamplingOption {
  label: string
  value: Resampling
  description: string
}

// UI-friendly resampling options
export const RESAMPLING_OPTIONS: ResamplingOption[] = [
  { label: 'Nearest', value: Resampling.NEAREST, description: 'Fastest, lowest quality' },
  { label: 'Bilinear', value: Resampling.BILINEAR, description: 'Good balance of speed and quality' },
  { label: 'Bicubic', value: Resampling.BICUBIC, description: 'Better quality, slower' },
  { label: 'Lanczos', value: Resampling.LANCZOS, description: 'Highest quality, slowest' },
  { label: 'Box', value: Resampling.BOX, description: 'Good for downsampling' },
  { label: 'Hamming', value: Resampling.HAMMING, description: 'Alternative high quality' }
]
