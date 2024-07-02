Hooks.on('init', () => {
  game.settings.register('monsterhearts', 'settings-override', {
    name: game.i18n.localize("monsterhearts.Settings.Title"),
    default: false,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: game.i18n.localize("monsterhearts.Settings.Hint"),
    requiresReload: true
  });
});

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

Hooks.on("createActor", async (actor) => {
  if (!actor.system.img || actor.system.img === "icons/svg/mystery-man.svg") {
    await actor.update({
      "img": "modules/monsterhearts/img/icons/cultist.svg"
    });
  }
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
            value: ""
          },
          darkestSelf: {
            position: "Top",
            label: game.i18n.localize("MONSTERHEARTS.DarkestSelf.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
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
