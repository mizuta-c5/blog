import { createRoot } from 'react-dom/client'
import TerminalEmuCard from '../components/TerminalEmuCard'

// 複数スライド対応：.js-terminal-emu を全部マウント
document.querySelectorAll<HTMLElement>('.js-terminal-emu').forEach((el) => {
  // 水和ではなくクライアント初期描画にする（hydration mismatch対策）
  createRoot(el).render(<TerminalEmuCard />)
})