export type BlockCategory = 'work' | 'study' | 'life' | 'other'

export const CATEGORY_CONFIG: Record<
  BlockCategory,
  { label: string; bgColor: string; borderColor: string; textColor: string }
> = {
  work: {
    label: '工作',
    bgColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
  },
  study: {
    label: '学习',
    bgColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
  },
  life: {
    label: '生活',
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
  },
  other: {
    label: '其他',
    bgColor: '#f3f4f6',
    borderColor: '#9ca3af',
    textColor: '#374151',
  },
}

export interface TimeBlock {
  id: string
  title: string
  category: BlockCategory
  dayIndex: number // 0-6
  startHour: number // 0-24，小数表示分钟 (如 8.5=08:30)
  endHour: number // 必须 > startHour
  createdAt: string
}
