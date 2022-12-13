import { App, PluginSettingTab, Setting, Notice,request } from 'obsidian';
import TextGeneratorPlugin from '../main';


export default class TextGeneratorSettingTab extends PluginSettingTab {
	plugin: TextGeneratorPlugin;

	constructor(app: App, plugin: TextGeneratorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		let models=new Map();
		if (this.plugin.clarifaiSettings.models?.size>0){
			models=this.plugin.clarifaiSettings.models;
		} else {
			["text-generation-english-gpt2", "text-generation-poems-chinese-gpt2"].forEach(e=>models.set(e,''));
			this.plugin.clarifaiSettings.models = models;
			this.plugin.saveClarifaiSettings();
		}
	}

	display(): void {
		const {
			containerEl
		} = this;

		containerEl.empty();

		containerEl.createEl('H1', {
			text: 'Text Generator Plugin Settings'
		});

		containerEl.createEl('H2', {
			text: 'Clarifai Settings'
		});
		let inputEl;
		containerEl.appendChild(createEl("a", {text: 'Create Clarifai account',href:"https://clarifai.com/signup?utm_source=clarifai-obsidian-plugin&utm_medium=referral", cls:'linkMoreInfo'}))
		
		// const ClarifaiUsername=new Setting(containerEl)
		// 	.setName('Username')
		// 	.setDesc('Enter your Clarifai platform username.')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your username')
		// 		.setValue(this.plugin.clarifaiSettings.user_id)
		// 		.onChange(async (value) => {
		// 			this.plugin.clarifaiSettings.user_id = value;
		// 			await this.plugin.saveClarifaiSettings();
		// 		}
		// 		)
		// 		.then((textEl)=>{
		// 			inputEl=textEl
		// 		})
		// 		.inputEl.setAttribute('type','clear')
		// 		)
		// const ClarifaiAppID=new Setting(containerEl)
		// 	.setName('Application ID')
		// 	.setDesc('Enter an application ID.  You can create an application for the purposes of calling this model.')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your application ID')
		// 		.setValue(this.plugin.clarifaiSettings.app_id)
		// 		.onChange(async (value) => {
		// 			this.plugin.clarifaiSettings.app_id = value;
		// 			await this.plugin.saveClarifaiSettings();
		// 		}
		// 		)
		// 		.then((textEl)=>{
		// 			inputEl=textEl
		// 		})
		// 		.inputEl.setAttribute('type','clear')
		// 		)

		
		const ClarifaiPAT=new Setting(containerEl)
			.setName('PAT')
			.setDesc('You will need a Personal Access Token (PAT) from the Clarifai platform.  The minimal permission scoping required for text generation is the predict scope.')
			.addText(text => text
				.setPlaceholder('Enter your PAT')
				.setValue(this.plugin.clarifaiSettings.pat)
				.onChange(async (value) => {
					this.plugin.clarifaiSettings.pat = value;
					await this.plugin.saveClarifaiSettings();
				}
				)
				.then((textEl)=>{
					inputEl=textEl
				})
				.inputEl.setAttribute('type','password')
				)
		ClarifaiPAT.addToggle(v => v
			.onChange( (value) => {
				if(value) {
					inputEl.inputEl.setAttribute('type','clear')
				}
				else {
					inputEl.inputEl.setAttribute('type','password')
				}
			}));
		containerEl.appendChild(createEl("a", {text: 'PAT documentation',href:"https://docs.clarifai.com/clarifai-basics/authentication/personal-access-tokens", cls:'linkMoreInfo'}))
	
		
		let models=new Map();
		if (this.plugin.clarifaiSettings.models?.size>0){
			models=this.plugin.clarifaiSettings.models;
		} else {
			["text-generation-english-gpt2", "text-generation-poems-chinese-gpt2"].forEach(e=>models.set(e,''));
			this.plugin.clarifaiSettings.models = models;
			this.plugin.saveClarifaiSettings();
		}
		
		let cbModelsEl:any
		new Setting(containerEl)
			.setName('Model')
			.setDesc('GPT2 is a transformers based model trained on a large amount of English data.')
			.addDropdown((cb) => {
				cbModelsEl =cb;
				models.forEach((value,key)=>{
					cb.addOption(key, key);
				})
				cb.setValue(this.plugin.clarifaiSettings.model);
				cb.onChange(async (value) => {
					this.plugin.clarifaiSettings.model = value;
					// TODO: Probably a better way to do this but need a three way map; maybe a dict but
					//	     don't feel like modifying the code substantially :D
					if (value == "text-generation-english-gpt2" || value == "text-generation-poems-chinese-gpt2") {
						this.plugin.clarifaiSettings.user_id = "textgen";
						this.plugin.clarifaiSettings.app_id = "text-generation";
					}
					await this.plugin.saveClarifaiSettings();
				});
			})
		
		containerEl.appendChild(createEl("a", {text: 'Model information',href:"https://clarifai.com/textgen/text-generation/models/text-generation-english-gpt2", cls:'linkMoreInfo'}))

		containerEl.createEl('H2', {
				text: 'Prompt parameters (completions)'
			});	
		// containerEl.createEl('H3', {
		// 		text: 'You can specify more paramters in the Frontmatter YMAL'
		// 	});	
		// containerEl.appendChild(createEl("a", {text: 'API documentation',href:"https://beta.openai.com/docs/api-reference/completions",cls:'linkMoreInfo'}))	
		new Setting(containerEl)
			.setName('Max tokens')
			.setDesc('The max number of the tokens that will be generated (1000 tokens ~ 750 words)')
			.addText(text => text
				.setPlaceholder('max_tokens')
				.setValue(this.plugin.clarifaiSettings.max_tokens.toString())
				.onChange(async (value) => {
					this.plugin.clarifaiSettings.max_tokens = parseInt(value);
					await this.plugin.saveClarifaiSettings();
				}));

		containerEl.createEl('H1', {
					text: 'Text Generator'
				});	
		containerEl.createEl('H3', {
					text: 'General'
				});	
		new Setting(containerEl)
			.setName('Show Status in StatusBar')
			.setDesc('Show information in the Status Bar')
			.addToggle(v => v
				.setValue(this.plugin.clarifaiSettings.showStatusBar)
				.onChange(async (value) => {
					this.plugin.clarifaiSettings.showStatusBar = value;
					await this.plugin.saveClarifaiSettings();
				}));

       const pathTempEl= new Setting(containerEl)
        .setName('Prompts Templates Path')
        .setDesc('Path of Prompts Templates')
        .addText(text => text
            .setValue(this.plugin.clarifaiSettings.promptsPath)
            .onChange(async (value) => {
                this.plugin.clarifaiSettings.promptsPath = value;
                await this.plugin.saveClarifaiSettings();
            })
			.inputEl.setAttribute('size','50')
			)
	
		containerEl.createEl('H3', {
				text: 'Considered Context'
			});	
		
		new Setting(containerEl)
		.setName('includeTitle')
		.setDesc('Include the title of the active document in the considered context.')
		.addToggle(v => v
			.setValue(this.plugin.clarifaiSettings.context.includeTitle)
			.onChange(async (value) => {
				this.plugin.clarifaiSettings.context.includeTitle = value;
				await this.plugin.saveClarifaiSettings();
			}));
				

		new Setting(containerEl)
		.setName('staredBlocks')
		.setDesc('Include stared blocks in the considered context.')
		.addToggle(v => v
			.setValue(this.plugin.clarifaiSettings.context.includeStaredBlocks)
			.onChange(async (value) => {
				this.plugin.clarifaiSettings.context.includeStaredBlocks = value;
				await this.plugin.saveClarifaiSettings();
			}));
		
		containerEl.createEl('H3', {
				text: 'Considered Context For Templates'
			});	
		
		new Setting(containerEl)
			.setName('includeFrontmatter')
			.setDesc('Include frontmatter')
			.addToggle(v => v
				.setValue(this.plugin.clarifaiSettings.context.includeFrontmatter)
				.onChange(async (value) => {
					this.plugin.clarifaiSettings.context.includeFrontmatter = value;
					await this.plugin.saveClarifaiSettings();
				}));
		
		new Setting(containerEl)
				.setName('includeHeadings')
				.setDesc('Include headings with their content.')
				.addToggle(v => v
					.setValue(this.plugin.clarifaiSettings.context.includeHeadings)
					.onChange(async (value) => {
						this.plugin.clarifaiSettings.context.includeHeadings = value;
						await this.plugin.saveClarifaiSettings();
					}));

		new Setting(containerEl)
				.setName('includeChildren')
				.setDesc('Include of the content of internal md links on the page.')
				.addToggle(v => v
					.setValue(this.plugin.clarifaiSettings.context.includeChildren)
					.onChange(async (value) => {
						this.plugin.clarifaiSettings.context.includeChildren = value;
						await this.plugin.saveClarifaiSettings();
					}));

		new Setting(containerEl)
				.setName('includeMentions')
				.setDesc('Include paragraphs from mentions (linked, unliked).')
				.addToggle(v => v
					.setValue(this.plugin.clarifaiSettings.context.includeMentions )
					.onChange(async (value) => {
						this.plugin.clarifaiSettings.context.includeMentions = value;
						await this.plugin.saveClarifaiSettings();
					}));

		new Setting(containerEl)
					.setName('includeHighlights')
					.setDesc('Include Obsidian Highlights.')
					.addToggle(v => v
						.setValue(this.plugin.clarifaiSettings.context.includeHighlights )
						.onChange(async (value) => {
							this.plugin.clarifaiSettings.context.includeHighlights = value;
							await this.plugin.saveClarifaiSettings();
						}));
		}
}
