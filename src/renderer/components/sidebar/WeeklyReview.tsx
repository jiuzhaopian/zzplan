import { useWeekStore } from '../../store/weekStore'
import { REVIEW_QUESTIONS } from '../../types/review'

export default function WeeklyReview() {
  const weekData = useWeekStore((s) => s.weekData)
  const updateReview = useWeekStore((s) => s.updateReview)

  const answers = weekData?.review?.answers ?? ['', '', '']

  return (
    <div className="p-4">
      <h3 className="text-[15px] font-[600] text-[#1e293b] mb-4">每周复盘</h3>

      <div className="space-y-4">
        {REVIEW_QUESTIONS.map((question, i) => (
          <div key={i}>
            <p className="text-[14px] font-[500] text-[#1e293b] mb-2 leading-relaxed">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-100 text-primary-600 text-[13px] font-[600] mr-1.5">
                {i + 1}
              </span>
              {question}
            </p>
            <textarea
              value={answers[i]}
              onChange={(e) => updateReview(i, e.target.value)}
              placeholder="写下你的思考..."
              rows={4}
              className="w-full text-[15px] font-[500] p-3 bg-white border border-[#dde3ee] rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary-400 focus:bg-white transition-colors leading-relaxed placeholder-[#94a3b8]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
