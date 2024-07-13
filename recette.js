const form = document.querySelector('form');
const recipeContainer = document.querySelector('.recipe-container');
const promptPopup = document.getElementById('promptPopup');
const closePopup = document.getElementById('closePopup');
const promptText = document.getElementById('promptText');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Récupérer les valeurs du formulaire
    const ingredients = document.getElementById('ingredients').value;
    const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(item => item.value);
    const dishType = document.getElementById('dish-type').value;
    const prepTime = document.getElementById('prep-time').value;

    // Créer le prompt pour l'API d'IA
    const prompt = `Créez une recette détaillée en utilisant les ingrédients suivants et en respectant les préférences alimentaires spécifiées.

Ingrédients : ${ingredients}
Préférences alimentaires : ${preferences.join(', ')}
Type de plat : ${dishType}
Temps de préparation : ${prepTime}

La recette doit inclure les sections suivantes :
1. Titre de la recette
2. Ingrédients (avec quantités)
3. Instructions de préparation (étape par étape)
4. Temps de cuisson et de préparation total
5. Nombre de portions

Merci !`;

    // Afficher le popup avec le prompt

    recipeContainer.innerHTML = '';
    loader.style.display = 'block';
    loadingText.style.display = 'block';

    fetchRecipe(prompt)
        .then(recipe => {
            displayRecipe(recipe);
            loader.style.display = 'none';
            loadingText.style.display = 'none';
        })
        .catch(error => {
            console.error('Erreur lors de la récupération de la recette :', error);
        });
});

async function chatCompletion(token, inputPrompt) {
    const apiBase = "https://api.endpoints.anyscale.com/v1";
    const url = `${apiBase}/chat/completions`;

    const body = {
        model: "meta-llama/Llama-2-70b-chat-hf",
        messages: [
            { role: "system", content: "Vous êtes un assistant utile qui suivra la structure de la question et répondra de manière directe." },
            { role: "user", content: inputPrompt }
        ],
        temperature: 0.225
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Erreur de requête : ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erreur : ${error}`);
        return null;
    }
}

// Fonction pour appeler l'API d'IA
async function fetchRecipe(prompt) {
    const apiToken = 'esecret_sxp5rzfb68hs29cne8knwndupy'; // Assurez-vous de gérer ce token de manière sécurisée
    const response = await chatCompletion(apiToken, prompt);

    if (response) {
        const recipe = response.choices[0].message.content.trim();
        return recipe;
    } else {
        throw new Error("Échec de la récupération de la réponse de l'API.");
    }
}

// Fonction pour afficher la recette
function displayRecipe(recipe) {
    const formattedRecipe = formatRecipe(recipe);
    recipeContainer.innerHTML = formattedRecipe;
}

// Fonction pour formater la recette
function formatRecipe(recipe) {
    const lines = recipe.split('\n');
    let formattedRecipe = '';

    lines.forEach(line => {
        if (line.startsWith('**Titre de la recette**')) {
            formattedRecipe += `<h2>${line.replace('**Titre de la recette** :', '').trim()}</h2>`;
        } else if (line.startsWith('**Ingrédients**')) {
            formattedRecipe += `<h3>Ingrédients</h3><ul>`;
        } else if (line.startsWith('* ')) {
            formattedRecipe += `<li>${line.replace('* ', '').trim()}</li>`;
        } else if (line.startsWith('**Instructions de préparation**')) {
            formattedRecipe += `</ul><h3>Instructions de préparation</h3>`;
        } else if (line.match(/^\d+\. /)) {
            formattedRecipe += `<p class="instructions">${line.trim()}</p>`;
        } else if (line.startsWith('**Temps de cuisson et de préparation total**')) {
            formattedRecipe += `</ul><div class="details"><p>${line.replace('**Temps de cuisson et de préparation total** :', 'Temps de cuisson et de préparation total :').trim()}</p>`;
        } else if (line.startsWith('**Nombre de portions**')) {
            formattedRecipe += `<p>${line.replace('**Nombre de portions** :', 'Nombre de portions :').trim()}</p></div>`;
        } else {
            formattedRecipe += `<p>${line.trim()}</p>`;
        }
    });

    return formattedRecipe;
}

// Fonction pour afficher la recette
function displayRecipe(recipe) {
    const formattedRecipe = formatRecipe(recipe);
    recipeContainer.innerHTML = formattedRecipe;
}


// Fonction pour afficher la recette
function displayRecipe(recipe) {
    const formattedRecipe = formatRecipe(recipe);
    recipeContainer.innerHTML = formattedRecipe;
}


// Fonction pour afficher le popup
function showPromptPopup(prompt) {
    promptText.textContent = prompt;
    promptPopup.style.display = "flex";
}

// Fermer le popup lorsqu'on clique sur le "x"
closePopup.addEventListener('click', () => {
    promptPopup.style.display = "none";
});

// Fermer le popup lorsqu'on clique en dehors du popup
window.addEventListener('click', (event) => {
    if (event.target == promptPopup) {
        promptPopup.style.display = "none";
    }
});
