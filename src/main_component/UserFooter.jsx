export default function UserFooter({ onQuickLink }) {
  return (
    <footer id="site-footer" className="bg-gradient-to-r from-sky-700 to-sky-500 text-sky-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        <section>
          <h3 className="text-4xl font-black text-white">CivicSense</h3>
          <p className="mt-4 max-w-sm text-lg leading-8 text-sky-100">
            A smart complaint portal for citizens to report, track, and resolve civic issues with transparent updates.
          </p>
        </section>

        <section>
          <h4 className="text-4xl font-black text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-lg text-sky-100">
            <li>
              <button type="button" onClick={() => onQuickLink?.("home")} className="transition hover:text-white">
                Home
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onQuickLink?.("register")} className="transition hover:text-white">
                Register Complaint
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onQuickLink?.("all")} className="transition hover:text-white">
                Track Complaint
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onQuickLink?.("about")} className="transition hover:text-white">
                About Us
              </button>
            </li>
          </ul>
        </section>

        <section>
          <h4 className="text-4xl font-black text-white">Contact</h4>
          <div className="mt-4 space-y-3 text-lg text-sky-100">
            <p>
              <span className="font-bold">Email:</span> support@civicsense.local
            </p>
            <p>
              <span className="font-bold">Phone:</span> +91 98765 43210
            </p>
            <p>
              <span className="font-bold">Location:</span> Smart City Control Center, Civic Plaza
            </p>
          </div>
        </section>

        <section>
          <h4 className="text-4xl font-black text-white">Get Updates</h4>
          <p className="mt-4 text-lg leading-8 text-sky-100">
            Receive complaint progress updates and city service announcements in your dashboard.
          </p>
        </section>
      </div>

      <div className="border-t border-sky-400/70">
        <p className="mx-auto max-w-7xl px-6 py-5 text-center text-lg text-sky-100">
          &copy; 2026 CivicSense Complaint Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
