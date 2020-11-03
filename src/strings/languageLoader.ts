export type LangLocale = 'es' | 'en' | 'en-IN' | 'en-US' | 'en-UK'

export default function languageLoader(langId: LangLocale): Promise<Record<string, Record<string, any>>> {
  switch (langId) {
    case 'es':
      return import('strings/strings.es.yaml')
    case 'en':
    case 'en-US':
    case 'en-IN':
    case 'en-UK':
    default:
      return import('strings/strings.en.yaml')
  }
}
