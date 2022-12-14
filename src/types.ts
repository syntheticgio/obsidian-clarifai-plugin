type Context= {
  includeTitle:boolean;
  includeStaredBlocks:boolean;
  includeFrontmatter:boolean;
  includeHeadings:boolean;
  includeChildren:boolean;
  includeMentions:boolean;
  includeHighlights:boolean;
}

type ClarifaiSettings = {
	pat: string;
  text_model: string;
  image_model: string;
  prompt: string;
  text_models: any;
  image_models: any;
  text_models_versions: any;
  image_models_versions: any;
  text_user_id: string;
  text_app_id: string;
  image_user_id: string;
  image_app_id: string;

	max_tokens: number;

	// frequency_penalty: number;
	promptsPath: string;
	showStatusBar: boolean;
  
  context: Context;
}

type TextGeneratorConfiguration = {
  packages: PackageTemplate[];
  installedPackages: InstalledPackage[];
}

type InstalledPackage = {
  packageId:string;
  version:string
  prompts:PromptTemplate[];
  installedPrompts: installedPrompts []
}

type installedPrompts ={
  promptId: string;
  version: string;
}

type PackageTemplate = {
  packageId: string;
  name: string;
  version:  string;
	minTextGeneratorVersion:  string;
	description:  string;
  tags :  string;
  author:  string;
	authorUrl: string;
  repo: string;
  published_at: Date;
  downloads:number;
}

type PromptTemplate =  {
    promptId: string;
    name: string;
    path: string;
    description: string;
    required_values: string;
    author: string;
    tags: string;
    version: string;
  }

type FileViewMode = 'source' | 'preview' | 'default';
enum NewTabDirection {
  vertical = "vertical", horizontal = "horizontal"
}

type Model = {
  id: string;
}
export type {
  FileViewMode,
  NewTabDirection,
	PromptTemplate,
  PackageTemplate,
  Model,
  Context,
  InstalledPackage,
  TextGeneratorConfiguration,
  ClarifaiSettings
}
