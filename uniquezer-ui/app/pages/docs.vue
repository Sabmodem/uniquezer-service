<template>
<nav>
    <h2>Table of Contents</h2>
    <ul>
        <li><a href="#info">General Information</a></li>
        <li><a href="#operations">Quick Reference for Operations</a></li>
        <li><a href="#rotate">Rotate</a></li>
        <li><a href="#crop">Crop</a></li>
        <li><a href="#resize">Resize</a></li>
        <li><a href="#transpose">Transpose</a></li>
        <li><a href="#enhance">Enhance</a></li>
        <li><a href="#filter">Filter</a></li>
        <li><a href="#admin">A Word from the Administration</a></li>
    </ul>
</nav>

<article>
    <section id="info">
        <h2>General Information on Bulk Image Transformation</h2>
        <p>
            This service was created to simplify the management and speed up the process of <b>bulk image processing</b>. It allows you to quickly generate <b>unique variations</b> of your photos, making it an excellent <b>photo uniqueizer</b> tool.
            The service provides image processing functions, including <b>rotate, crop, resize, transpose, enhance, and filter</b>.
        </p>
    </section>

    <section id="operations">
        <h2>Quick Reference: How to Use Bulk Image Processing</h2>
        <p>You can use various operations to work with images. Operations can be added in <b>any order</b> and with any desired parameters. It is possible to add the same type of operation multiple times. All operations will be executed in the order they are added. If you swap two operations in the queue, the final result will be different.</p>
    </section>

    <section id="rotate">
        <h2>Rotate</h2>
        <p>
            Returns a rotated copy of this image. This method returns a copy of this image, rotated the given number of degrees counter-clockwise around its center.
        </p>

        <h3>Parameters:</h3>
        <ul>
            <li><b>angle</b> – In degrees counter-clockwise.</li>
            <li>
                <b>resample</b> – An optional resampling filter. This can be one of:
                <ul>
                    <li><b>NEAREST</b> (use nearest neighbor)</li>
                    <li><b>BILINEAR</b> (linear interpolation in a 2x2 environment)</li>
                    <li><b>BICUBIC</b> (cubic spline interpolation in a 4x4 environment)</li>
                </ul>
                If omitted, or if the image has a restricted mode, it is set to NEAREST.
            </li>
            <li>
                <b>expand</b> – Optional expansion flag. If `true`, expands the output image to make it large enough to hold the entire rotated image. If `false` or omitted, the output image will be the same size as the input image. Note that the expand flag assumes rotation around the center and no translation.
            </li>
            <li><b>center</b> – Optional center of rotation (a 2-tuple). Origin is the upper-left corner. Default is the center of the image.</li>
            <li><b>fillcolor</b> – An optional color for the area outside the rotated image.</li>
        </ul>
    </section>

    <section id="crop">
        <h2>Crop</h2>
        <p>Crops the image by the specified number of pixels on each side.</p>
    </section>

    <section id="resize">
        <h2>Resize</h2>
        <p>Returns a resized copy of this image.</p>

        <h3>Parameters:</h3>
        <ul>
            <li><b>size</b> – The requested size in pixels, as a tuple or array: (width, height).</li>
            <li>
                <b>resample</b> – An optional resampling filter. This can be one of: <b>NEAREST, BOX, BILINEAR, HAMMING, BICUBIC, or LANCZOS</b>. If the image has a restricted mode, it is always set to NEAREST. Otherwise, the default filter is BICUBIC.
            </li>
        </ul>
    </section>

    <section id="transpose">
        <h2>Transpose</h2>
        <p>Transpose image (flip or rotate in 90-degree steps).</p>

        <h3>Parameters:</h3>
        <ul>
            <li>
                <b>method</b> – One of: <b>flip left right, flip top bottom, rotate 90, rotate 180, rotate 270, transpose, or transverse</b>.
            </li>
        </ul>
    </section>

    <section id="enhance">
        <h2>Enhance</h2>

        <h3>General Enhancement</h3>
        <p>
            The general `enhance` function returns an enhanced image.
        </p>
        <h4>Parameters:</h4>
        <ul>
            <li>
                <b>factor</b> – A floating point value controlling the enhancement. Factor <b>1.0</b> always returns a copy of the original image, lower factors mean less effect (less color, brightness, contrast, etc.), and higher values mean more effect. There are no restrictions on this value.
            </li>
        </ul>

        <h3>Specific Enhancements</h3>
        <p>There are specific classes for adjusting different aspects of an image:</p>

        <h4>Color Adjustment</h4>
        <p>Adjust image color balance. An enhancement factor of <b>0.0</b> gives a black and white image. A factor of <b>1.0</b> gives the original image.</p>

        <h4>Contrast Adjustment</h4>
        <p>Adjust image contrast. An enhancement factor of <b>0.0</b> gives a solid gray image, a factor of <b>1.0</b> gives the original image, and greater values increase the contrast of the image.</p>

        <h4>Brightness Adjustment</h4>
        <p>Adjust image brightness. An enhancement factor of <b>0.0</b> gives a black image, a factor of <b>1.0</b> gives the original image, and greater values increase the brightness of the image.</p>

        <h4>Sharpness Adjustment</h4>
        <p>Adjust image sharpness. An enhancement factor of <b>0.0</b> gives a blurred image, a factor of <b>1.0</b> gives the original image, and a factor of <b>2.0</b> gives a sharpened image.</p>

    </section>

    <section id="filter">
        <h2>Filter</h2>
        <p>The service provides the following set of predefined image enhancement filters:</p>
        <ul>
            <li><b>BLUR</b></li>
            <li><b>CONTOUR</b></li>
            <li><b>DETAIL</b></li>
            <li><b>EDGE ENHANCE</b></li>
            <li><b>EDGE ENHANCE MORE</b></li>
            <li><b>EMBOSS</b></li>
            <li><b>FIND EDGES</b></li>
            <li><b>SHARPEN</b></li>
            <li><b>SMOOTH</b></li>
            <li><b>SMOOTH MORE</b></li>
        </ul>
    </section>

    <section id="admin">
        <h2>A Word from the Administration</h2>
        <p>The service team thanks you for your attention. We are constantly developing the service and striving to make it more convenient for you. We wish you pleasant use!</p>
    </section>
</article>
</template>

<script setup lang="ts">
useHead({
  title: 'Bulk Image Processor & Photo Uniqueizer | Rotate, Crop, Resize Images Online',
  meta: [
    { 
      name: 'description', 
      content: 'The best bulk image processing tool. Use our service to transform, resize, rotate, and create unique image variations for all your content and content spin needs.' 
    },
    { 
      name: 'keywords', 
      content: 'bulk image processing, photo uniqueizer, image unique, make image unique online, rotate, crop, resize, transpose, batch photo editor, create unique variations, content spin' 
    },
    { property: 'og:title', content: 'Bulk Image Processor & Photo Uniqueizer | Rotate, Crop, Resize Images Online' },
    { property: 'og:description', content: 'The best bulk image processing tool. Use our service to transform, resize, rotate, and create unique image variations for all your content and content spin needs.' },
    { property: 'og:type', content: 'website' }
  ]
})
</script>

<style scoped>
    body {
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
    }
    header, nav, article {
        max-width: 900px;
        margin: auto;
        padding-bottom: 20px;
        text-align: justify;
    }
    nav, section {
        border-radius: 10px;
        border: 1px solid;
        margin-top: 10px;
        padding: 15px;
    }
    nav ul {
        list-style: none;
        padding-left: 0;
    }
    nav li {
        margin: 4px 0;
    }
    nav a {
        text-decoration: none;
        color: #0073e6;
    }
    nav a:hover {
        text-decoration: underline;
    }
    h1 { font-size: 1.8em; margin-top: 1.2em; }
    h2 { font-size: 1.4em; margin-top: 1.2em; }
    h3 { font-size: 1.2em; margin-top: 1em; }
    p { margin: 0.6em 0; }
    ul, ol { margin-left: 1.5em; }
</style>