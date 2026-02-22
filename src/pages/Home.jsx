import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white">

      {/* ===== NAVBAR ===== */}
      <nav className="
        flex items-center justify-between
        px-8 py-5
        bg-white/10 backdrop-blur-xl
        border-b border-white/20
      ">
        {/* Title */}
        <h1 className="text-2xl font-bold tracking-wide">
          Peer<span className="text-indigo-400">Review</span>
        </h1>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/login"
            className="
              px-4 py-2 rounded-lg
              bg-white/10 border border-white/20
              hover:bg-white/20 transition
            "
          >
            Login
          </Link>

          <Link
            to="/register"
            className="
              px-4 py-2 rounded-lg
              bg-indigo-500/30 border border-indigo-400/40
              text-indigo-200 font-semibold
              hover:bg-indigo-500/40 transition
            "
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="
        max-w-5xl mx-auto
        px-6 py-24
        text-center
      ">
        <h2 className="text-5xl font-extrabold leading-tight">
          Simplifying Academic
          <span className="block text-indigo-400 mt-2">
            Peer Review Process
          </span>
        </h2>

        <p className="mt-6 text-lg text-white/70 max-w-3xl mx-auto">
          A centralized platform where students can submit projects,
          peers and instructors can evaluate them, and feedback is
          managed transparently — all in one place.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <Link
            to="/register"
            className="
              px-6 py-3 rounded-xl
              bg-indigo-500/30 border border-indigo-400/40
              text-indigo-200 font-semibold
              hover:bg-indigo-500/40 transition
            "
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="
              px-6 py-3 rounded-xl
              bg-white/10 border border-white/20
              hover:bg-white/20 transition
            "
          >
            Already a Member?
          </Link>
        </div>
      </section>

      {/* ===== INFO CARDS ===== */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="
            p-6 rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            hover:bg-white/15 transition
            hover:scale-[1.04]
          ">
            <h3 className="text-xl font-semibold mb-2">
              For Students
            </h3>
            <p className="text-white/70">
              Submit projects, receive structured feedback,
              and track evaluations in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="
            p-6 rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            hover:bg-white/15 transition
            hover:scale-[1.04]
          ">
            <h3 className="text-xl font-semibold mb-2">
              For Teachers
            </h3>
            <p className="text-white/70">
              Create classrooms, review student projects,
              assign marks, and export evaluation reports.
            </p>
          </div>

          {/* Card 3 */}
          <div className="
            p-6 rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            hover:bg-white/15 transition
            hover:scale-[1.04]
          ">
            <h3 className="text-xl font-semibold mb-2">
              Transparent Evaluation
            </h3>
            <p className="text-white/70">
              Ensure fair, structured, and organized peer
              review with role-based access.
            </p>
          </div>

        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="
        text-center py-6
        text-white/50
        border-t border-white/10
      ">
        © {new Date().getFullYear()} Peer Review System — Academic Project
      </footer>

    </div>
  );
}

export default Home;