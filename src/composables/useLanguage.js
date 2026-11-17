import { ref } from 'vue'

const currentLang = ref('th')

export function useLanguage() {
  const setLanguage = (lang) => {
    currentLang.value = lang
    document.documentElement.lang = lang
  }

  const toggleLanguage = () => {
    setLanguage(currentLang.value === 'th' ? 'en' : 'th')
  }

  return {
    currentLang,
    setLanguage,
    toggleLanguage
  }
}
