export namespace main {
	
	export class ImageDialogResult {
	    Base64String: string;
	    Width: number;
	    Height: number;
	    Filename: string;
	    MimeType: string;
	    DataURI: string;
	    LocalUri: string;
	
	    static createFrom(source: any = {}) {
	        return new ImageDialogResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Base64String = source["Base64String"];
	        this.Width = source["Width"];
	        this.Height = source["Height"];
	        this.Filename = source["Filename"];
	        this.MimeType = source["MimeType"];
	        this.DataURI = source["DataURI"];
	        this.LocalUri = source["LocalUri"];
	    }
	}
	export class ImageInfo {
	    Base64String: string;
	    Width: number;
	    Height: number;
	    Filename: string;
	    MimeType: string;
	    DataURI: string;
	
	    static createFrom(source: any = {}) {
	        return new ImageInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Base64String = source["Base64String"];
	        this.Width = source["Width"];
	        this.Height = source["Height"];
	        this.Filename = source["Filename"];
	        this.MimeType = source["MimeType"];
	        this.DataURI = source["DataURI"];
	    }
	}

}

