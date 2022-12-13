import {App,addIcon, Notice, Plugin, PluginSettingTab, Setting, request, MarkdownView, Editor, parseFrontMatterAliases} from 'obsidian';
import {ClarifaiTextGeneratorSettings} from './types';
import TextGeneratorPlugin from './main';
import {IGNORE_IN_YMAL} from './constants';
import ContextManager from './ContextManager';

export default class ReqFormatter {
    plugin: TextGeneratorPlugin;
    app: App;
    contextManager:ContextManager;
	constructor(app: App, plugin: TextGeneratorPlugin,contextManager:ContextManager) {
        this.app = app;
		this.plugin = plugin;
        this.contextManager=contextManager;
	}

    addContext(parameters: ClarifaiTextGeneratorSettings,prompt: string){
        const params={
           ...parameters,
           prompt	
       }
       return params;
   }
   
    prepareReqParameters(params: ClarifaiTextGeneratorSettings,insertMetadata: boolean,templatePath:string="") {
        // TODO: Need to make the actual request here....
       let bodyParams:any = {
            "inputs": [
                {
                    "data": {
                        "text": {
                            "raw": params.prompt
                        }
                    }
                }
            ]
        //    "max_tokens": params.max_tokens,
       };
       
       let reqParams = {
           url: `https://api.clarifai.com/v2/users/${params.user_id}/apps/${params.app_id}/models/${params.model}/outputs`,
           method: 'POST',
           body:'',
           headers: {
               "Content-Type": "application/json",
               "Authorization": `Key ${params.pat}`
           },
        //    extractResult: "requestResults?.choices[0].text"
       }
       console.log("URL: " + reqParams.url);
   
       if (insertMetadata) {
           const activefileFrontmatter =  this.contextManager.getMetaData()?.frontmatter;
           const templateFrontmatter =  this.contextManager.getMetaData(templatePath)?.frontmatter;
           const frontmatter = {...templateFrontmatter,...activefileFrontmatter};
           if (frontmatter == null) {
               new Notice("No valid Metadata (YAML front matter) found!");
           } else {
               if(frontmatter["bodyParams"] && frontmatter["config"]?.append?.bodyParams==false){
                   bodyParams = {prompt:params.prompt,...frontmatter["bodyParams"]};
               } else if (frontmatter["bodyParams"]) {
                   bodyParams = {...bodyParams,...frontmatter["bodyParams"]}; 
               } 
               
               if (frontmatter["config"]?.context &&  frontmatter["config"]?.context !== "prompt") 
               {
                   bodyParams[frontmatter["config"].context]=params.prompt;
                   delete bodyParams.prompt;
               }
               
               reqParams.body=	JSON.stringify(bodyParams);
   
            //    if (frontmatter["config"]?.output) 
            //    {
            //        reqParams.extractResult= frontmatter["config"]?.output
            //    }
   
               if(frontmatter["reqParams"] && frontmatter["config"]?.append?.reqParams==false){
                   reqParams = frontmatter["reqParams"];
               } else if (frontmatter["reqParams"]) {
                   reqParams= {...reqParams,...frontmatter["reqParams"]} 
               } 
           } 
       } else {
           reqParams.body=	JSON.stringify(bodyParams);
       }

    //    console.log("Return value: ");
    //    console.log({bodyParams,reqParams});
       return reqParams;
   }
}