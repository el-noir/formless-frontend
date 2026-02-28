export function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-gray-800 py-16 text-gray-400" aria-label="Footer">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <a href="/" className="inline-flex items-center gap-2 mb-6 group focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-lg">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-purple to-brand-purple flex items-center justify-center text-white font-bold text-xs" aria-hidden="true">
              FI
            </div>
            <span className="text-white font-semibold">Formless</span>
          </a>
          <p>
            Transforming data collection with intelligent conversations.
          </p>
        </div>

        <div>
          <h4 className="text-white font-medium mb-4">Product</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 Formless Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
