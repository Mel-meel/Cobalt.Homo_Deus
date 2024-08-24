document.addEventListener('DOMContentLoaded', () => {
    const languageSelection = document.getElementById('languageSelection');
    const frenchButton = document.getElementById('frenchButton');
    const englishButton = document.getElementById('englishButton');
    const languageSelect = document.getElementById('languageSelect');

    // Vérifiez si la langue a déjà été définie dans le localStorage
    if (!localStorage.getItem('appLanguage')) {
        // Affiche la fenêtre de sélection de langue
        languageSelection.style.display = 'block';
    } else {
        // Appliquer la langue stockée
        const storedLang = localStorage.getItem('appLanguage');
        applyTranslations(storedLang);
        languageSelect.value = storedLang;
    }

    // Quand l'utilisateur choisit une langue
    frenchButton.addEventListener('click', () => {
        setLanguage('fr');
    });

    englishButton.addEventListener('click', () => {
        setLanguage('en');
    });

    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        setLanguage(selectedLang);
    });

    function setLanguage(lang) {
        localStorage.setItem('appLanguage', lang);
        applyTranslations(lang);
        languageSelection.style.display = 'none'; // Cache la fenêtre après la sélection
    }

    function applyTranslations(lang) {
        fetch('../data/translations.json')
            .then(response => response.json())
            .then(translations => {
                const elementsToTranslate = document.querySelectorAll('[data-i18n]');
                
                elementsToTranslate.forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    if (translations[lang] && translations[lang][key]) {
                        element.textContent = translations[lang][key];
                    }
                });
            });
    }
});
