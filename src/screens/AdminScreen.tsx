import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import type { PartOfSpeech, VocabularyItem, WordCategory } from '../types'
import { useAppStore } from '../store/useAppStore'

// 데이터 바인딩용 영문 카테고리 풀
const CATEGORIES: WordCategory[] = [
  'Spells',
  'Characters',
  'Places',
  'Magical Creatures',
  'General',
]

// 화면 표시용 한국어 카테고리 매핑 딕셔너리
const CATEGORY_LABELS: Record<WordCategory, string> = {
  'Spells': '🔮 주문 (Spells)',
  'Characters': '🧙‍♂️ 인물 (Characters)',
  'Places': '🏰 장소 (Places)',
  'Magical Creatures': '🐉 신비한 동물 (Creatures)',
  'General': '📜 일반 마법어 (General)'
}

// 데이터 바인딩용 영문 품사 풀
const POS_OPTIONS: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb', 'etc.']

// 화면 표시용 한국어 품사 매핑 딕셔너리
const POS_LABELS: Record<PartOfSpeech, string> = {
  'noun': '명사 (noun)',
  'verb': '동사 (verb)',
  'adjective': '형용사 (adjective)',
  'adverb': '부사 (adverb)',
  'etc.': '기타 타입 (etc.)'
}

const emptyForm = {
  word: '',
  meaning: '',
  partOfSpeech: 'noun' as PartOfSpeech,
  exampleEn: '',
  exampleKo: '',
  category: 'General' as WordCategory,
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-gold/50 text-white'

export function AdminScreen() {
  const navigate = useNavigate()
  const vocabulary = useAppStore((s) => s.vocabulary)
  const addWord = useAppStore((s) => s.addWord)
  const updateWord = useAppStore((s) => s.updateWord)
  const deleteWord = useAppStore((s) => s.deleteWord)
  const resetAllData = useAppStore((s) => s.resetAllData)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.word || !form.meaning || !form.exampleEn || !form.exampleKo) return

    if (editingId) {
      updateWord(editingId, form)
      setEditingId(null)
    } else {
      addWord(form)
    }
    setForm(emptyForm)
  }

  const startEdit = (item: VocabularyItem) => {
    setEditingId(item.id)
    setForm({
      word: item.word,
      meaning: item.meaning,
      partOfSpeech: item.partOfSpeech,
      exampleEn: item.exampleEn,
      exampleKo: item.exampleKo,
      category: item.category,
    })
  }

  const confirmReset = () => {
    if (window.confirm('모든 학습 데이터와 커스텀 주문장을 초기화할까요? 이 작업은 마법으로도 되돌릴 수 없습니다.')) {
      resetAllData()
    }
  }

  return (
    <div className="min-h-dvh flex-1 overflow-y-auto bg-bg">
      <PageContainer wide>
        {/* 관리자 상단 헤더 영역 */}
        <header className="mb-8 flex items-center gap-4 border-b border-white/10 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gold hover:bg-white/5 transition-colors"
          >
            ← 성으로 돌아가기
          </button>
          <h1 className="font-display text-3xl text-gold font-bold">호그와트 마법 관리자 제어판</h1>
        </header>

        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
          {/* 좌측 패널: 주문 데이터 입력 폼 */}
          <form onSubmit={submit} className="glass-card h-fit space-y-3 p-6 rounded-2xl border border-white/10 bg-white/5">
            <h2 className="mb-2 text-lg font-bold text-gold">
              {editingId ? '🪄 마법 단어 수정' : '📜 새로운 마법 단어 추가'}
            </h2>
            
            <input
              placeholder="영어 단어 입력 *"
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              className={inputClass}
              required
            />
            <input
              placeholder="한국어 뜻 의미 매핑 *"
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              className={inputClass}
              required
            />
            
            {/* 품사 선택 셀렉트 박스 한글화 */}
            <select
              value={form.partOfSpeech}
              onChange={(e) =>
                setForm({ ...form, partOfSpeech: e.target.value as PartOfSpeech })
              }
              className={`${inputClass} bg-[#0D0B1F]`}
            >
              {POS_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {POS_LABELS[p]}
                </option>
              ))}
            </select>
            
            <input
              placeholder="호그와트 테마 영어 예문 *"
              value={form.exampleEn}
              onChange={(e) => setForm({ ...form, exampleEn: e.target.value })}
              className={inputClass}
              required
            />
            <input
              placeholder="예문 한국어 번역 해석 *"
              value={form.exampleKo}
              onChange={(e) => setForm({ ...form, exampleKo: e.target.value })}
              className={inputClass}
              required
            />
            
            {/* 마법 카테고리 선택 셀렉트 박스 한글화 */}
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as WordCategory })
              }
              className={`${inputClass} bg-[#0D0B1F]`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1 bg-gold text-[#0D0B1F] font-bold py-2.5 rounded-lg hover:opacity-90 transition-all">
                {editingId ? '수정 사항 저장' : '데이터 저장고에 추가'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                  className="btn-primary flex-1 bg-fail text-[#aaa] font-bold py-2.5 rounded-lg hover:bg-opacity-80 transition-all"
                >
                  편집 취소
                </button>
              )}
            </div>
          </form>

          {/* 우측 패널: 현재 저장고에 귀속된 단어 목록 매트릭스 */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gold">현재 등록된 단어 마법 명부 ({vocabulary.length})</h2>
            <div className="glass-card overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[#AAAAAA] text-xs uppercase tracking-wider">
                      <th className="px-4 py-3.5 font-bold">단어</th>
                      <th className="px-4 py-3.5 font-bold">한국어 뜻</th>
                      <th className="px-4 py-3.5 font-bold">분류 카테고리</th>
                      <th className="px-4 py-3.5 font-bold">학습 상태</th>
                      <th className="px-4 py-3.5 text-right font-bold">마법 제어</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabulary.map((v) => (
                      <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 text-white transition-colors">
                        <td className="px-4 py-3 font-semibold">{v.word}</td>
                        <td className="px-4 py-3 text-[#aaa] font-medium">{v.meaning}</td>
                        <td className="px-4 py-3 text-purple font-medium">{CATEGORY_LABELS[v.category] || v.category}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${v.status === 'memorized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {v.status === 'memorized' ? '마스터' : '복습 대기'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => startEdit(v)}
                            className="mr-3 text-gold hover:underline text-xs font-bold"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if(window.confirm(`[${v.word}] 주문을 아카이브에서 영구 삭제하시겠습니까?`)) {
                                deleteWord(v.id)
                              }
                            }}
                            className="inline-flex text-red-400 hover:text-red-300 align-middle transition-colors"
                            aria-label="단어 삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 최하단 위험 구역: 데이터 마스터 리셋 */}
        <div className="mt-12 border-t border-red-500/10 pt-6">
          <button
            type="button"
            onClick={confirmReset}
            className="btn-primary w-full max-w-xs border border-red-500/40 bg-red-900/20 text-red-300 font-bold py-3 rounded-lg hover:bg-red-900/30 transition-all block text-center"
          >
            ⚠️ 전체 데이터 숲 초기화 (Melt Data)
          </button>
        </div>
      </PageContainer>
    </div>
  )
}