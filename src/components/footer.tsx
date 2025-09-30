import { Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center space-y-3">
        <p className="text-gray-700 max-w-2xl mx-auto">
            This app was built to strengthen the Iovine and Young Academy community. Reach out if you have any questions 
            and be sure to share this with other students!
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-700 font-medium">Questions?</span>
            <Mail className="h-5 w-5 text-cardinal" />
            <a 
              href="mailto:btinsley@usc.edu" 
              className="text-cardinal hover:text-cardinal-light font-medium"
            >
              btinsley@usc.edu
            </a>
          </div>
          
          
          <p className="text-sm text-gray-500">
            <span className="inline-block bg-cardinal/10 text-cardinal px-3 py-1 rounded-full font-medium">
              Beta
            </span>
            <span className="mx-2">•</span>
            New features coming soon
          </p>
        </div>
      </div>
    </footer>
  )
}
