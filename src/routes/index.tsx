import { Hono } from 'hono'
import ReactDOMServer from 'react-dom/server'
import { slide } from '../client/slide'
import AISunsetCard from '../components/AISunsetCard'
import Carousel from '../components/Carousel'
import Layout from '../components/Layout'
import Nav from '../components/Nav'
import SampleCard1 from '../components/SampleCard1'
import SampleCard2 from '../components/SampleCard2'
import SampleCard3 from '../components/SampleCard3'
import SkillsModal from '../components/SkillsModal'
import TerminalCard from '../components/TerminalCard'
import ThreeDModelCard from '../components/ThreeDModelCard'
import { getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types/misc'

const Home = ({ user }: { user: { name: string } | null }) => (
  <Layout title="Welcome to Our Site">
    <Nav user={user} />

    <section className={`${slide.section} w-full h-[30vh] sm:h-[50vh] flex items-center`}>
      <Carousel slideWidth="85%" maxWidthPx={720} minWidthPx={320} gutterPx={12} edgePaddingPx={12}>
        <AISunsetCard />
        <TerminalCard />
        <SampleCard1 />
        <SampleCard2 />
        <SampleCard3 />
        {/* <ThreeDModelCard /> */}
        {/* 必要なら他のスライドも同じ枠で追加 */}
        {/* <AnotherCard /> */}
      </Carousel>
    </section>

    <section id="about" className="about p-5 sm:p-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">About</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            id="open-skills"
            role="button"
            tabIndex={0}
            className="feature cursor-pointer bg-white p-6 rounded-lg shadow-md outline-none hover:shadow-lg transition"
            aria-haspopup="dialog"
            aria-controls="skills-modal"
            aria-label="Open Skills modal"
          >
            <h3 className="text-2xl font-semibold mb-4">Skills</h3>
            <p>Key abilities and expertise.</p>
          </div>
          <div className="feature bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Projects</h3>
            <p>Notable work and achievements.</p>
          </div>
          <div className="feature bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Contact</h3>
            <p>Ways to reach me.</p>
          </div>
        </div>
      </div>
    </section>

    <SkillsModal />

    <script type="module" src="/js/embla-init.js" defer></script>
    <script type="module" src="/js/editor.js" defer></script>
  </Layout>
)

export default Home

export const home = new Hono<{ Bindings: Bindings; Variables: Variables }>()

home.get('/', async (c) => {
  const user = await getUserFromCookie(c)

  return c.html(ReactDOMServer.renderToString(<Home user={user as { name: string } | null} />))
})
