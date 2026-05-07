import { useState, useCallback } from 'react'
import type { GTFSFeed } from '../types/gtfs'
import type { ValidationResult } from '../types/gtfs'
import { parseGTFSZip } from '../utils/parser'
import { runAllValidations } from '../validators/checks'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function useFeed() {
  const [status, setStatus] = useState<Status>('idle')
  const [feed, setFeed] = useState<GTFSFeed | null>(null)
  const [results, setResults] = useState<ValidationResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [feedName, setFeedName] = useState<string>('')
  const [loadingStep, setLoadingStep] = useState<string>('')

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading')
    setError(null)
    setFeedName(file.name)
    try {
      setLoadingStep('Parsing ZIP...')
      const parsed = await parseGTFSZip(file)
      setLoadingStep('Running validations...')
      const validationResults = runAllValidations(parsed)
      setFeed(parsed)
      setResults(validationResults)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setFeed(null)
    setResults([])
    setError(null)
    setFeedName('')
    setLoadingStep('')
  }, [])

  return { status, feed, results, error, feedName, loadingStep, loadFile, reset }
}
