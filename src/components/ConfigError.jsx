import { AlertCircle } from 'lucide-react'
import { missingFirebaseEnv } from '../firebase/config'

export function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">App configuration missing</h1>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Firebase environment variables are not set. The app cannot start without them.
        </p>
        {missingFirebaseEnv.length > 0 && (
          <ul className="text-xs font-mono bg-neutral-100 rounded-xl p-3 mb-4 space-y-1 text-neutral-700">
            {missingFirebaseEnv.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        )}
        <div className="text-sm text-neutral-600 space-y-2">
          <p className="font-semibold text-neutral-800">Local development</p>
          <p>Copy <code className="text-xs bg-neutral-100 px-1 rounded">.env.example</code> to{' '}
            <code className="text-xs bg-neutral-100 px-1 rounded">.env</code> and fill in your Firebase keys, then run{' '}
            <code className="text-xs bg-neutral-100 px-1 rounded">npm run dev</code> again.</p>
          <p className="font-semibold text-neutral-800 pt-2">Netlify</p>
          <p>Add the same variables under Site configuration → Environment variables, then trigger a new deploy.</p>
        </div>
      </div>
    </div>
  )
}
