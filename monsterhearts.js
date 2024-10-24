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
  const correctPasswordGroup1 = "mot_8_page_124";  // Remplacez par le 8ème mot de la page 124

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
  html.find('button[type="submit"]').click(() => {
    setTimeout(() => {
      window.location.reload(); // Forcer un rechargement complet de la page après la sauvegarde des paramètres
    }, 500); // Ajouter un petit délai pour s'assurer que les paramètres sont d'abord enregistrés
  });
});

// Également déclencher après le chargement avec un délai pour attraper d'éventuels retards de chargement initiaux
Hooks.on('ready', () => {
  setTimeout(unlockCompendiumsWithPassword, 1000);
});

Hooks.once('ready', async function() {
  const journalEntryUuidFrench = "Compendium.monsterhearts.sources-et-credits.JournalEntry.4tyMVpJxQSbXLmvO";
  const journalEntryUuidEnglish = "Compendium.monsterhearts.sources-and-credits.JournalEntry.kgKyp984r139nDwK";
  const delay = 2000;

  setTimeout(async () => {
    try {
      // Check if the language is French or not
      const journalEntryUuid = game.i18n.lang === 'fr' ? journalEntryUuidFrench : journalEntryUuidEnglish;
      const journalEntry = await fromUuid(journalEntryUuid);

      if (journalEntry) {
        journalEntry.sheet.render(true);
      } else {
        console.error(`Journal entry with UUID ${journalEntryUuid} not found`);
      }
    } catch (error) {
      console.error(`Error fetching journal entry: ${error}`);
    }
  }, delay);
});

Hooks.on("renderSettings", (app, html) => {
  const links = {
    shop: {
      title: game.i18n.localize(`MONSTERHEARTS.Links.ShopTitle`),
      url: game.i18n.localize(`MONSTERHEARTS.Links.ShopURL`),
      iconClass: "fa-solid fa-cart-shopping"
    },
    git: {
      title: game.i18n.localize(`MONSTERHEARTS.Links.GitTitle`),
      url: game.i18n.localize(`MONSTERHEARTS.Links.GitURL`),
      iconClass: "fab fa-github"
    },
    donation: {
      title: game.i18n.localize(`MONSTERHEARTS.Links.DonationTitle`),
      url: game.i18n.localize(`MONSTERHEARTS.Links.DonationURL`),
      iconClass: "fa-regular fa-mug-hot fa-bounce"
    }
  };

  const createButton = (text, iconClass, url) => {
    const button = $(`<button><i class="${iconClass}"></i> ${text}</button>`);
    button.on("click", ev => {
      ev.preventDefault();
      window.open(url, "_blank");
    });
    return button;
  };

  const addLinkButton = (container, link) => {
    const button = createButton(link.title, link.iconClass, link.url);
    container.append(button);
  };

  const title = game.i18n.localize(`MONSTERHEARTS.Links.Title`);
  const lotdSection = $(`<h2>${title} <i class="fa-light fa-up-right-from-square"></i></h2>`);
  html.find("#settings-game").after(lotdSection);

  const lotdDiv = $(`<div></div>`);
  lotdSection.after(lotdDiv);

  Object.values(links).forEach(link => {
    addLinkButton(lotdDiv, link);
  });
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
