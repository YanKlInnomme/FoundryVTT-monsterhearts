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

  Babele?.get()?.register({
    module: 'monsterhearts',
    lang: 'fr',
    dir: 'compendium'
  });
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
    const button = $(`<button><i class="${iconClass}"></i> ${text} <sup><i class="fa-light fa-up-right-from-square"></i></sup></button>`);
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
  const lotdSection = $(`<h2>${title}</h2>`);
  html.find("#settings-game").after(lotdSection);

  const lotdDiv = $(`<div></div>`);
  lotdSection.after(lotdDiv);

  addLinkButton(lotdDiv, links.shop);
  addLinkButton(lotdDiv, links.git);
  addLinkButton(lotdDiv, links.donation);
});

Hooks.once('pbtaSheetConfig', () => {
  const failurelabel = game.i18n.localize("PBTA.failure");
  const partiallabel = game.i18n.localize("PBTA.partial");
  const successlabel = game.i18n.localize("PBTA.success");
  const stats = ["Hot", "Cold", "Volatile", "Dark"];
  const movetypes = ["Moves", "PlaybookMoves", "Bargains", "Hexes"];
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
        attrTop: {
          sexmove: {
            label: game.i18n.localize("MONSTERHEARTS.Sexmove.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
          },
          darkestSelf: {
            label: game.i18n.localize("MONSTERHEARTS.DarkestSelf.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
          },
        },
        attrLeft: {
          harm: {
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
            label: game.i18n.localize("MONSTERHEARTS.Look.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          eyes: {
            label: game.i18n.localize("MONSTERHEARTS.Eyes.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          origin: {
            label: game.i18n.localize("MONSTERHEARTS.Origin.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          xp: {
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
            label: game.i18n.localize("MONSTERHEARTS.Advancement1.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement2: {
            label: game.i18n.localize("MONSTERHEARTS.Advancement2.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement3: {
            label: game.i18n.localize("MONSTERHEARTS.Advancement3.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement4: {
            label: game.i18n.localize("MONSTERHEARTS.Advancement4.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          },
          advancement5: {
            label: game.i18n.localize("MONSTERHEARTS.Advancement5.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Text",
            value: ""
          }
        },

        moveTypes: Object.fromEntries(movetypes.map(type => {
          let creationValue = true;
          if (type.toLowerCase() === "class") {
              creationValue = false;
          }
          return [type.toLowerCase(), { 
              label: game.i18n.localize(`MONSTERHEARTS.MoveTypes.${type}`), 
              moves: [], 
              creation: creationValue 
          }];
       })),
      
        equipmentTypes: Object.fromEntries(equipmenttypes.map(type => [type.toLowerCase(), { label: game.i18n.localize(`MONSTERHEARTS.EquipmentTypes.${type}`), mouvements: [] }]))
      },
      npc: {
        attrTop: {
          impulse: {
            label: game.i18n.localize("MONSTERHEARTS.Impulse.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
          },
          stake: {
            label: game.i18n.localize("MONSTERHEARTS.Stake.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
          },
          connectedthreats: {
            label: game.i18n.localize("MONSTERHEARTS.ConnectedThreats.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "LongText",
            value: ""
          }
        },
        attrLeft: {
          countdown: {
            label: game.i18n.localize("MONSTERHEARTS.Countdown.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "Resource",
            value: 0,
            max: 0
          },
          kind: {
            label: game.i18n.localize("MONSTERHEARTS.Kind.Options.Label"),
            description: null,
            customLabel: false,
            userLabel: false,
            type: "ListOne",
            default: 0,
            condition: false,
            options: Object.fromEntries(kindoptions.map(option => [option, { label: game.i18n.localize(`MONSTERHEARTS.Kind.Options.${option}`), value: false }])),
          }
        },
        moveTypes: {
          threat: {
            label: game.i18n.localize("MONSTERHEARTS.MoveTypes.Threat"),
            moves: []
          }
        },
        equipmentTypes: Object.fromEntries(equipmenttypes.map(type => [type.toLowerCase(), { label: game.i18n.localize(`MONSTERHEARTS.EquipmentTypes.${type}`), mouvements: [] }]))
      }
    }
  };

  Hooks.once('ready', async function() {
    try {
      const overrideSettings = await game.settings.get('monsterhearts', 'settings-override');
    
      if (!overrideSettings) {
        await game.settings.set('pbta', 'hideRollMode', true);
        await game.settings.set('pbta', 'hideUses', true);
      }
    } catch (error) {
      console.error("Error accessing monsterhearts settings:", error);
    }
  });
});
