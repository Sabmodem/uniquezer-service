import type { AnyImageOperation, RotateOperation, CropOperation, ResizeOperation, TransposeOperation, TransformOperation, ConvertOperation, EnhanceOperation, SimpleFilterOperation } from '~/types'
import { UniqueizationType, Resampling, Transpose, Transform, EnhanceMethod, SimpleFilterMethod } from '~/types'

export const createDefaultOperation = (type: UniqueizationType): AnyImageOperation => {
  switch (type) {
    case UniqueizationType.ROTATE:
      return {
        type,
        angle: 0,
        expand: false,
        resample: Resampling.NEAREST,
        fillcolor: null,
        center: null
      } as RotateOperation

    case UniqueizationType.CROP:
      return {
        type,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100
      } as CropOperation

    case UniqueizationType.RESIZE:
      return {
        type,
        width: 200,
        height: 200,
        resample: Resampling.BILINEAR
      } as ResizeOperation

    case UniqueizationType.TRANSPOSE:
      return {
        type,
        transpose: Transpose.FLIP_LEFT_RIGHT
      } as TransposeOperation

    case UniqueizationType.TRANSFORM:
      return {
        type,
        method: Transform.AFFINE,
        data: [1, 0, 0, 0, 1, 0],
        resample: Resampling.NEAREST,
        fillcolor: null
      } as TransformOperation

    case UniqueizationType.CONVERT:
      return {
        type,
        mode: null,
        matrix: null,
        dither: null,
        palette: null,
        colors: null
      } as ConvertOperation

    case UniqueizationType.ENHANCE:
      return {
        type,
        method: EnhanceMethod.BRIGHTNESS,
        factor: 1.0
      } as EnhanceOperation

    case UniqueizationType.SIMPLE_FILTER:
      return {
        type,
        method: SimpleFilterMethod.BLUR
      } as SimpleFilterOperation

    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}
