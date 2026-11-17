import type { AnyImageOperation, RotateOperation, CropOperation, ResizeOperation, TransformOperation, ConvertOperation, EnhanceOperation, SimpleFilterOperation } from '~/types'
import { UniqueizationType, Transform, RESAMPLING_OPTIONS } from '~/types'

export const getOperationSummary = (op: AnyImageOperation): string => {
  switch (op.type) {
    case UniqueizationType.ROTATE: {
      const rotateOp = op as RotateOperation
      const resampleLabel = RESAMPLING_OPTIONS.find(o => o.value === rotateOp.resample)?.label || 'Default'
      return `${rotateOp.angle}° | Expand: ${rotateOp.expand ? 'Yes' : 'No'} | Resample: ${resampleLabel}`
    }
    
    case UniqueizationType.CROP: {
      const cropOp = op as CropOperation
      return `Box: (${cropOp.left}, ${cropOp.top}) to (${cropOp.right}, ${cropOp.bottom})`
    }
    
    case UniqueizationType.RESIZE: {
      const resizeOp = op as ResizeOperation
      const resampleLabel = RESAMPLING_OPTIONS.find(o => o.value === resizeOp.resample)?.label || 'Default'
      return `${resizeOp.width}x${resizeOp.height} pixels | Resample: ${resampleLabel}`
    }
    
    case UniqueizationType.TRANSFORM: {
      const transformOp = op as TransformOperation
      const methodOptions = [
        { label: 'Affine', value: Transform.AFFINE },
        { label: 'Extent', value: Transform.EXTENT },
        { label: 'Perspective', value: Transform.PERSPECTIVE },
        { label: 'Quad', value: Transform.QUAD },
        { label: 'Mesh', value: Transform.MESH }
      ]
      const methodLabel = methodOptions.find(o => o.value === transformOp.method)?.label || 'Unknown'
      return `Method: ${methodLabel} | Data points: ${transformOp.data.length}`
    }
    
    case UniqueizationType.CONVERT: {
      const convertOp = op as ConvertOperation
      const mode = convertOp.mode || 'Auto'
      let summary = `Mode: ${mode}`
      
      if (convertOp.palette) {
        summary += `, Palette: ${convertOp.palette}`
      }
      if (convertOp.colors) {
        summary += ` (${convertOp.colors} colors)`
      }
      return summary
    }
    
    case UniqueizationType.ENHANCE: {
      const enhanceOp = op as EnhanceOperation
      const methodLabel = enhanceOp.method.charAt(0).toUpperCase() + enhanceOp.method.slice(1)
      return `${methodLabel} | Factor: ${enhanceOp.factor}`
    }
    
    case UniqueizationType.SIMPLE_FILTER: {
      const filterOp = op as SimpleFilterOperation
      return `Filter: ${filterOp.method}`
    }
    
    default:
      return 'No specific summary available'
  }
}

export const getOperationIcon = (type: UniqueizationType): string => {
  switch (type) {
    case UniqueizationType.ROTATE:
      return 'mdi-rotate-right'
    case UniqueizationType.CROP:
      return 'mdi-crop'
    case UniqueizationType.RESIZE:
      return 'mdi-resize'
    case UniqueizationType.TRANSFORM:
      return 'mdi-vector-square'
    case UniqueizationType.TRANSPOSE:
      return 'mdi-flip-horizontal'
    case UniqueizationType.CONVERT:
      return 'mdi-palette'
    case UniqueizationType.ENHANCE:
      return 'mdi-brightness-6'
    case UniqueizationType.SIMPLE_FILTER:
      return 'mdi-filter'
    default:
      return 'mdi-cog'
  }
}

export const getOperationTypeLabel = (type: UniqueizationType): string => {
  switch (type) {
    case UniqueizationType.ROTATE:
      return 'Rotate'
    case UniqueizationType.CROP:
      return 'Crop'
    case UniqueizationType.RESIZE:
      return 'Resize'
    case UniqueizationType.TRANSFORM:
      return 'Transform'
    case UniqueizationType.TRANSPOSE:
      return 'Transpose'
    case UniqueizationType.CONVERT:
      return 'Convert'
    case UniqueizationType.ENHANCE:
      return 'Enhance'
    case UniqueizationType.SIMPLE_FILTER:
      return 'Filter'
    default:
      return type
  }
}
