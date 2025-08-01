Hooks.on('babele.init', () => {
  if (game.babele) {
    const lang = game.i18n.lang;
    if (lang === 'fr') {
      game.babele.register({
        module: 'monsterhearts',
        lang: 'fr',
        dir: 'compendium/fr'
      });
      console.log('Babele activé en français.');
    } else if (lang === 'en') {
      game.babele.register({
        module: 'monsterhearts',
        lang: 'en',
        dir: 'compendium/en'
      });
      console.log('Babele activated in English.');
    } else {
      console.log('Babele is inactive.');
    }
  }
});

function loadCSS(filePath) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = filePath;
  document.head.appendChild(link);
}

Hooks.once('ready', () => {
  const currentLanguage = game.settings.get("core", "language");
  const baseCssFilePath = "modules/monsterhearts/css/monsterhearts.css";
  const languageSpecificCssFilePath = currentLanguage === "fr" 
    ? "modules/monsterhearts/css/monsterhearts-fr.css" 
    : "modules/monsterhearts/css/monsterhearts-en.css";
  
  loadCSS(baseCssFilePath);
  loadCSS(languageSpecificCssFilePath);

  Hooks.on("renderSettingsConfig", () => {
    const newLanguage = game.settings.get("core", "language");
    if (newLanguage !== currentLanguage) {
      location.reload();
    }
  });
});

Hooks.once('ready', () => {
    game.settings.set('pbta', 'hideRollMode', true);
});

function generateTokenImageFilenames(name, ext) {
  const variants = [
    '-token', '_token', 'token', '(token)', '[token]', 
    '%20-%20token', '%20_%20token', '%20token', '%20(token)', '%20[token]',
    '-Token', '_Token', 'Token', '(Token)', '[Token]', 
    '%20-%20Token', '%20_%20Token', '%20Token', '%20(Token)', '%20[Token]'
  ];

  return variants.map(variant => `${name}${variant}.${ext}`);
}

async function fileExists(filePath) {
  const basePath = filePath.split('/').slice(0, -1).join('/');
  try {
    const result = await FilePicker.browse('data', basePath);
    return result.files.includes(filePath);
  } catch (error) {
    return false;
  }
}

async function getTokenImagePath(actorImgPath) {
  const imgParts = actorImgPath.split('/');
  const fileName = imgParts.pop();
  const [name, ext] = fileName.split('.');
  const basePath = imgParts.join('/');

  const possibleFilenames = generateTokenImageFilenames(name, ext);

  const fileChecks = possibleFilenames.map(async (tokenFileName) => {
    const tokenImgPath = `${basePath}/${tokenFileName}`;
    return await fileExists(tokenImgPath) ? tokenImgPath : null;
  });

  const results = await Promise.all(fileChecks);
  const tokenImgPath = results.find(path => path !== null);

  return tokenImgPath || actorImgPath;
}

Hooks.on("createActor", async (actor, options, userId) => {
  try {
    if (options.duplicate) return;

    if (!actor.img || actor.img === "icons/svg/mystery-man.svg") {
      const actorImg = "modules/monsterhearts/img/icons/cultist.svg";
      const tokenImg = await getTokenImagePath(actorImg);

      await actor.update({ "img": actorImg });
      await actor.prototypeToken.update({ "texture.src": tokenImg });

      Hooks.once("renderActorSheet", (sheet) => {
        if (sheet.actor.id === actor.id) {
          sheet.render();
        }
      });
    }
  } catch (error) {
    console.error('Error in createActor hook:', error);
  }
});

Hooks.on("updateActor", async (actor, data, options, userId) => {
  try {
    if (data.img) {
      const tokenImg = await getTokenImagePath(data.img);

      await actor.prototypeToken.update({ "texture.src": tokenImg });

      const tokens = actor.getActiveTokens(true);
      for (let token of tokens) {
        await token.document.update({ "texture.src": tokenImg });
      }
    }
  } catch (error) {
    console.error('Error in updateActor hook:', error);
  }
});

const hideAndRestrictCompendiums = () => {
  const currentLanguage = game.settings.get("core", "language");
  if (currentLanguage !== "fr") {
    const compendiumsToHide = [
      "monsterhearts.actions",
      "monsterhearts.actions-de-la-mue-tbomh",
      "monsterhearts.actions-des-mues",
      "monsterhearts.actions-des-mues-ii",
      "monsterhearts.aides-de-jeu",
      "monsterhearts.maledictions",
      "monsterhearts.mues",
      "monsterhearts.mues-ii",
      "monsterhearts.mue-tbomh",
      "monsterhearts.pactes",
      "monsterhearts.sources-et-credits"
    ];

    compendiumsToHide.forEach(compendiumName => {
      const compendium = game.packs.get(compendiumName);
      if (compendium) {
        // Cacher visuellement le compendium
        const compendiumElement = $(`.directory-item[data-pack='${compendium.collection}']`);
        if (compendiumElement.length) {
          compendiumElement.hide();
        }

        // Restreindre l'accès aux documents du compendium
        const originalGetDocuments = compendium.getDocuments;
        compendium.getDocuments = async function (...args) {
          if (game.settings.get("core", "language") !== "fr") {
            console.log(`No access to the compendium ${compendiumName}`);
            return [];
          }
          return originalGetDocuments.apply(this, args);
        };

        // Restreindre l'accès à l'index du compendium
        const originalGetIndex = compendium.getIndex;
        compendium.getIndex = async function (...args) {
          if (game.settings.get("core", "language") !== "fr") {
            console.log(`No access to the compendium ${compendiumName}`);
            return [];
          }
          return originalGetIndex.apply(this, args);
        };
      }
    });
  };
  if (currentLanguage == "fr") {
    const compendiumsToHide = [
      "monsterhearts.sources-and-credits",
      "monsterhearts.game-aids"
    ];

    compendiumsToHide.forEach(compendiumName => {
      const compendium = game.packs.get(compendiumName);
      if (compendium) {
        // Cacher visuellement le compendium
        const compendiumElement = $(`.directory-item[data-pack='${compendium.collection}']`);
        if (compendiumElement.length) {
          compendiumElement.hide();
        }

        // Restreindre l'accès aux documents du compendium
        const originalGetDocuments = compendium.getDocuments;
        compendium.getDocuments = async function (...args) {
          if (game.settings.get("core", "language") == "fr") {
            console.log(`Pas d'accès au compendium ${compendiumName}`);
            return [];
          }
          return originalGetDocuments.apply(this, args);
        };

        // Restreindre l'accès à l'index du compendium
        const originalGetIndex = compendium.getIndex;
        compendium.getIndex = async function (...args) {
          if (game.settings.get("core", "language") == "fr") {
            console.log(`Pas d'accès au compendium ${compendiumName}`);
            return [];
          }
          return originalGetIndex.apply(this, args);
        };
      }
    });
  };
};

// Exécuter la fonction au chargement du jeu
Hooks.once('ready', () => {
  hideAndRestrictCompendiums();
});

// Réexécuter la fonction lorsque la langue change
Hooks.on('updateSetting', (setting, value) => {
  if (setting.key === 'language') {
    hideAndRestrictCompendiums();
  }
});

Hooks.on('ready', () => {
  setTimeout(hideAndRestrictCompendiums, 1000);
});

Hooks.on('renderCompendiumDirectory', () => {
  setTimeout(hideAndRestrictCompendiums, 1000);
});


const unlockCompendiumsWithPassword = () => {
  const currentLanguage = game.settings.get("core", "language");
  
  if (currentLanguage !== "fr") return;

  // Le mot de passe requis pour le groupe 1
  const correctPasswordGroup1 = "puis";

  // Définir les compendiums à cacher et protéger
  const compendiumsToHide = [
    { name: "monsterhearts.actions-des-mues-ii", group: 1 },
    { name: "monsterhearts.mues-ii", group: 1 },
    { name: "monsterhearts.skins", group: null } // Toujours verrouillé
  ];

  // Enregistrer les paramètres pour la saisie du mot de passe si la langue est le français
  game.settings.register("monsterhearts", "group1Password", {
    name: "Entrez le 8ème mot de la page 124",
    hint: "pour déverrouiller le contenu issu du livre 'Volume 2'",
    scope: "client",
    config: currentLanguage === "fr",  // Afficher uniquement lorsque la langue est le français
    type: String,
    default: ""
  });

  // Obtenir le mot de passe fourni
  const inputPasswordGroup1 = game.settings.get("monsterhearts", "group1Password");

  // Fonction pour cacher, protéger et déverrouiller les compendiums
  const protectCompendiums = () => {
    compendiumsToHide.forEach(({ name, group }) => {
      const compendium = game.packs.get(name);
      if (!compendium) return;

      // Obtenir l'élément de compendium dans la barre latérale
      const compendiumElement = $(`.directory-item[data-pack='${compendium.collection}']`);

      // Restreindre l'accès sauf si le mot de passe est correct
      const originalGetDocuments = compendium.getDocuments;
      const originalGetIndex = compendium.getIndex;

      compendium.getDocuments = async function (...args) {
        if (group === 1 && inputPasswordGroup1 !== correctPasswordGroup1) return [];
        if (group === null) return []; // Toujours verrouillé
        return originalGetDocuments.apply(this, args);
      };

      compendium.getIndex = async function (...args) {
        if (group === 1 && inputPasswordGroup1 !== correctPasswordGroup1) return [];
        if (group === null) return []; // Toujours verrouillé
        return originalGetIndex.apply(this, args);
      };

      // Cacher visuellement le compendium si le mot de passe est incorrect ou verrouillé
      if ((group === 1 && inputPasswordGroup1 !== correctPasswordGroup1) || 
          group === null) {
        if (compendiumElement.length) compendiumElement.hide();
      } else {
        // Afficher le compendium si le mot de passe correct est fourni
        if (compendiumElement.length) compendiumElement.show();
      }
    });
  };

  // Exécuter la logique de protection à la charge du jeu
  protectCompendiums();
};

// Hooks pour déclencher la fonction
Hooks.once('ready', () => {
  unlockCompendiumsWithPassword();
});

// Mettre à jour automatiquement les compendiums lors des mises à jour des paramètres
Hooks.on('updateSetting', (setting, value) => {
  if (setting.key === 'core.language' || setting.key === 'monsterhearts.group1Password') {
    unlockCompendiumsWithPassword();
  }
});

// Ajouter un hook pour forcer un rechargement complet de la page après la fermeture de la fenêtre des paramètres
Hooks.on("renderSettingsConfig", (app, html, data) => {
  const submitButton = html.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener("click", () => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }
});

// Également déclencher après le chargement avec un délai pour attraper d'éventuels retards de chargement initiaux
Hooks.on('ready', () => {
  setTimeout(unlockCompendiumsWithPassword, 1000);
});

Hooks.on("renderSettings", addMonsterheartsLinksToSettings);

function addMonsterheartsLinksToSettings(app, html) {
  const gameSettingsHeader = html.querySelector("h4.divider");
  if (!gameSettingsHeader) {
    console.error("No header <h4.divider> found in parameters");
    return;
  }

  const currentLang = game.i18n.lang;

  const logoMap = {
    "fr": {
      "light": "logo-fr.svg",
      "dark": "logo-fr-dark.svg"
    }
  };

  const defaultLogos = {
    "light": "logo.svg",
    "dark": "logo-dark.svg"
  };

  function getCurrentTheme() {
    if (html.classList.contains("theme-dark")) return "dark";
    if (html.classList.contains("theme-light")) return "light";
    return game.settings.get("core", "uiConfig")?.colorScheme?.interface || "light";
  }

  function getLogoPath() {
    const theme = getCurrentTheme();

    let logoFile;
    if (logoMap[currentLang]?.[theme]) {
      logoFile = logoMap[currentLang][theme];
    } else if (logoMap[currentLang]) {
      logoFile = logoMap[currentLang]["light"] || Object.values(logoMap[currentLang])[0];
    } else {
      logoFile = defaultLogos[theme] || defaultLogos["light"];
    }

    return `modules/monsterhearts/img/${logoFile}`;
  }

  // Création de la section personnalisée
  const section = document.createElement("section");
  section.classList.add("settings", "flexcol");

  section.innerHTML = `
    <h4 class="divider">${game.i18n.localize("MONSTERHEARTS.Links.Title")}</h4>
    <div class="k4lt system-badge">
      <img class="mh-dynamic-logo" src="${getLogoPath()}">
    </div>
  `;

  const linkKeys = [
    { icon: "fa-solid fa-cart-shopping", key: "Shop" },
    { icon: "fab fa-github", key: "Git" },
    { icon: "fa-regular fa-mug-hot fa-bounce", key: "Donation" }
  ];

  for (let i = 0; i < linkKeys.length; i++) {
    const link = linkKeys[i];
    const localizedText = game.i18n.localize(`MONSTERHEARTS.Links.${link.key}Title`);
    const localizedURL = game.i18n.localize(`MONSTERHEARTS.Links.${link.key}URL`);
    const linkSection = document.createElement("section");
    linkSection.classList.add("settings", "flexcol");

    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<i class="${link.icon}"></i> ${localizedText} <sup><i class="fa-light fa-up-right-from-square"></i></sup>`;

    if (i === linkKeys.length - 1) {
      button.style.marginBottom = "1rem";
    }

    button.addEventListener("click", ev => {
      ev.preventDefault();
      window.open(localizedURL, "_blank");
    });

    linkSection.appendChild(button);
    section.appendChild(linkSection);
  }

  gameSettingsHeader.parentNode.insertBefore(section, gameSettingsHeader);

  // Observer pour changer le logo selon thème
  const logoImg = section.querySelector(".mh-dynamic-logo");
  const observer = new MutationObserver(() => {
    const newSrc = getLogoPath();
    if (logoImg.getAttribute("src") !== newSrc) {
      logoImg.setAttribute("src", newSrc);
    }
  });
  observer.observe(html, { attributes: true, attributeFilter: ["class"] });
}

Hooks.once("ready", async function () {
  // Définir une image personnalisée pour l'écran de connexion
  if (!game.user.isGM) return;
  
  // Enregistrer le paramètre firstTime s'il n'existe pas déjà
  game.settings.register("monsterhearts", "firstTime", {
    name: game.i18n.localize("MONSTERHEARTS.Settings.firstTime.name"),
    hint: game.i18n.localize("MONSTERHEARTS.Settings.firstTime.hint"),
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // Enregistrer le paramètre enableLoginImg s'il n'existe pas déjà
  game.settings.register("monsterhearts", "enableLoginImg", {
    name: game.i18n.localize("MONSTERHEARTS.Settings.enableLoginImg.name"),
    hint: game.i18n.localize("MONSTERHEARTS.Settings.enableLoginImg.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      // Appliquer ou restaurer l'image selon la valeur
      applyOrRestoreLoginImage(value);
    }
  });

  // Enregistrer le paramètre pour sauvegarder l'image de fond précédente
  game.settings.register("monsterhearts", "originalBackground", {
    name: "Original background image",
    hint: "Save previous background image",
    scope: "world",
    config: false,
    type: String,
    default: null
  });

  // Fonction pour appliquer ou restaurer l'image de connexion
  async function applyOrRestoreLoginImage(enable) {
    let backgroundPath;
    
    if (enable) {
      // Sauvegarder l'image actuelle avant de la changer
      const currentBackground = game.world.background || "";
      if (currentBackground && currentBackground !== `modules/monsterhearts/img/cover.webp`) {
        await game.settings.set("monsterhearts", "originalBackground", currentBackground);
      }
      backgroundPath = `modules/monsterhearts/img/cover.webp`;
    } else {
      // Restaurer l'image précédente
      backgroundPath = game.settings.get("monsterhearts", "originalBackground") || null;
    }

    // CORRECTION : Utiliser l'API Setup de Foundry v13
    try {
      console.log("Attempting to modify with the Setup API...");
      
      // Méthode 1: Utiliser l'API Setup (recommandée pour v13)
      const response = await foundry.utils.fetchWithTimeout("/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "editWorld",
          id: game.world.id,
          background: backgroundPath
        })
      });
      
      if (response.ok) {
        console.log(`Background image ${enable ? 'applied' : 'restored'} : ${backgroundPath}`);
        console.log("Please refresh the page to see the changes or reconnect to the world.");
      } else {
        throw new Error(`Réponse HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error("Error with API Setup:", error);
      
      // Méthode de fallback 1: Socket
      try {
        console.log("Attempt with socket...");
        const socketResponse = await game.socket.emit("manageWorld", {
          action: "editWorld",
          worldId: game.world.id,
          updateData: { background: backgroundPath }
        });
        console.log(`Background image ${enable ? 'applied' : 'restored'} via socket : ${backgroundPath}`);
      } catch (socketError) {
        console.error("Error with socket:", socketError);
        
        // Méthode de fallback 2: Document update
        try {
          console.log("Attempt with update document...");
          await game.world.update({ background: backgroundPath });
          console.log(`Background image ${enable ? 'applied' : 'restored'} via document : ${backgroundPath}`);
        } catch (docError) {
          console.error("Error with document update:", docError);
          
          // Information pour l'utilisateur
          ui.notifications.warn("Unable to change image automatically. Please go to Edit World > Background Image and change the background image manually.");
        }
      }
    }
  }

  if (game.settings.get("monsterhearts", "firstTime")) {
    game.settings.set("monsterhearts", "firstTime", false);
    
    const callback = async () => {
      // Sauvegarder l'image actuelle avant de la changer
      const currentBackground = game.world.background || "";
      if (currentBackground) {
        await game.settings.set("monsterhearts", "originalBackground", currentBackground);
        console.log("Original background image saved :", currentBackground);
      }
      
      await game.settings.set("monsterhearts", "enableLoginImg", true);
      // L'onChange callback se chargera d'appliquer l'image
    };

    // Créer la boîte de dialogue de confirmation avec prévisualisation
    foundry.applications.api.DialogV2.confirm({
      window: {
        title: game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.title"),
        width: 500,
        height: "auto"
      },
      content: `
        <div style="text-align: center;">
          <div>
            <img src="modules/monsterhearts/img/cover.webp" 
                 style="max-width: 400px; max-height: 250px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" 
                 alt="${game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.imageAlt")}">
          </div>
          <p style="font-size: 0.9em; color: #666; font-style: italic;">
            ${game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.preview")}
          </p>
        </div>
        <p style="font-weight: bold; margin-bottom: -0.4rem;">${game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.content.one")}</p>
        <p style="margin-top: -0.4rem;">${game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.content.two")}</p>
      `,
      rejectClose: false,
      modal: true,
      yes: { 
        callback: callback,
        label: game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.yes"),
        icon: "fas fa-check"
      },
      no: {
        label: game.i18n.localize("MONSTERHEARTS.Settings.startup.dialog.no"),
        icon: "fas fa-times"
      }
    });
    
  } else {
    // Si ce n'est pas le premier démarrage, vérifier si l'image doit être appliquée
    if (game.settings.get("monsterhearts", "enableLoginImg")) {
      await applyOrRestoreLoginImage(true);
    }
  }
});

Hooks.once('ready', async function() {
  // Utilise le paramètre firstTime
  if (!game.settings.get("monsterhearts", "firstTime")) {
    return; // Pas le premier lancement, ne pas afficher le journal
  }
  
  const journalEntryUuidFrench = "Compendium.monsterhearts.sources-et-credits.JournalEntry.4tyMVpJxQSbXLmvO";
  const journalEntryUuidEnglish = "Compendium.monsterhearts.sources-and-credits.JournalEntry.kgKyp984r139nDwK";
  const delay = 2000;

  setTimeout(async () => {
    try {
      // Choisir le journal selon la langue
      const journalEntryUuid = game.i18n.lang === 'fr' ? journalEntryUuidFrench : journalEntryUuidEnglish;
      const journalEntry = await fromUuid(journalEntryUuid);
      
      if (journalEntry) {
        journalEntry.sheet.render(true);
        console.log("Monsterhearts: Journal d'accueil affiché pour le premier lancement");
      } else {
        console.error(`Journal entry with UUID ${journalEntryUuid} not found`);
      }
    } catch (error) {
      console.error(`Error fetching journal entry: ${error}`);
    }
  }, delay);
});

Hooks.once('pbtaSheetConfig', () => {
  const failurelabel = game.i18n.localize("PBTA.failure");
  const partiallabel = game.i18n.localize("PBTA.partial");
  const successlabel = game.i18n.localize("PBTA.success");
  const stats = ["Hot", "Cold", "Volatile", "Dark"];
  const movetypes = ["Moves", "SkinMoves", "Bargains", "Hexes"];
  const equipmenttypes = ["Strings", "SympatheticTokens"];
  const kindoptions = ["1", "2", "3", "4", "5", "6", "7"];

  game.settings.set('pbta', 'sheetConfigOverride', true);
  game.pbta.tagConfigOverride = {
    general: '[{"value":"feu"}]',
    actor: {
      all: '[{"value":"personne"}]',
      character: '[{"value":"larbin"}]'
    },
    item: {
      all: '[{"value":"consommable"}]',
      move: '[{"value":"épée"}]'
    }
  };
  game.pbta.sheetConfig = {
    rollFormula: "2d6",
    rollResults: {
      failure: {
        start: null,
        end: 6,
        label: failurelabel
      },
      partial: {
        start: 7,
        end: 9,
        label: partiallabel
      },
      success: {
        start: 10,
        end: 12,
        label: successlabel
      }
    },
    actorTypes: {
      character: {
        stats: Object.fromEntries(stats.map(stat => [stat.toLowerCase(), { label: game.i18n.localize(`MONSTERHEARTS.Stats.${stat}`), value: 0 }])),
        attributes: {
          sexmove: {
            position: "Top",
            label: game.i18n.localize("MONSTERHEARTS.Sexmove.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: "",
            playbook: true
          },
          darkestSelf: {
            position: "Top",
            label: game.i18n.localize("MONSTERHEARTS.DarkestSelf.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: "",
            playbook: true
          },
          harm: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Harm.Label"),
            description: game.i18n.localize("MONSTERHEARTS.Harm.Description"),
            customLabel: false,
            userLabel: false,
            type: "Clock",
            value: 0,
            max: 4,
            steps: Array(4).fill(false)
          },
          look: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Look.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          eyes: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Eyes.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          origin: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Origin.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          xp: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Xp.Label"),
            description: game.i18n.localize("MONSTERHEARTS.Xp.Description"),
            customLabel: false,
            userLabel: false,
            type: "Xp",
            value: 0,
            max: 5,
            steps: Array(5).fill(false)
          },
          advancement: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "ListMany",
            condition: false,
            playbook: true
          },
          advancement1: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement1.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement2: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement2.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement3: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement3.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement4: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement4.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement5: {
            position: "Left",
            label: game.i18n.localize("MONSTERHEARTS.Advancement5.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          }
        },
        moveTypes: Object.fromEntries(movetypes.map(type => {
          const creationValue = type.toLowerCase() === "moves";
          return [type.toLowerCase(), {
            label: game.i18n.localize(`MONSTERHEARTS.MoveTypes.${type}`),
            moves: [],
            creation: creationValue
          }];
        })),
        equipmentTypes: Object.fromEntries(equipmenttypes.map(type => [type.toLowerCase(), { label: game.i18n.localize(`MONSTERHEARTS.EquipmentTypes.${type}`), mouvements: [] }]))
      },
      npc: {

      }
    }
  };
});


