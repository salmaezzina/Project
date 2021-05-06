export class Broker {
	private static instance: Broker;
	private topics: { [key in string]?: { (msg:any): void; }[] };
	private constructor() {
		this.topics = {};
  	}
	public static getInstance(): Broker {
    		if (!Broker.instance) {
      			Broker.instance = new Broker();
    		}
    		return Broker.instance;
  	}
	public subscribe(topic:string,callback: (msg:any) => void) : void {
		if (topic && !this.topics[topic]) {
            		this.topics[topic] = [];
        	}
		this.topics[topic].push(callback);
	}
	public unsubscribe(topic:string,callback: (msg:any) => void) : void {
		if (topic && !this.topics[topic]) {
                        return;
                }
		this.topics[topic] = this.topics[topic].filter(function (x) { return x != callback; });
        	if (!this.topics[topic].length) {
            		delete this.topics[topic];
        	}			
	}
	public publish(topic:string,msg:any):void{
		let v = this.topics[topic];
		if(v != null && typeof v !== "undefined"){
			for(var i=0;i<v.length;++i){
				var callback = v[i];
				callback(msg);
			}
		}
	}	
}

export enum IntentEvent {
	DISPLAY = 1 << 1,
	CREATE = 1 << 2,
	UPDATE = 1 << 3,
	DELETE = 1 << 4,
	ADD = 1 << 5,
	REMOVE = 1 << 6
}

export enum StateChangeEvent {
	LOADED = 1 << 7,
	CREATED = 1 << 8,
	UPDATED = 1 << 9,
	DELETED = 1 << 10,
	ADDED = 1 << 11,
	REMOVED = 1 << 12
}

export class MVPEvent<T> {
	private readonly _event: IntentEvent | StateChangeEvent;
	private readonly _state:T;
	constructor(event: IntentEvent | StateChangeEvent,state:T){
		this._event = event;
		this._state = state;
	}
	public isIntent():boolean{
		return this._event in IntentEvent;
	}
	public isStateChange():boolean{
		return this._event in StateChangeEvent;
	}
	public get event(){
		return this._event;
	}
	public get state(){
		return this._state;
	}
}

export class Observable {
	protected readonly _topic: string;
	constructor(theTopic:string){
		this._topic = theTopic;
	}
	protected notify(msg:any){
		Broker.getInstance().publish(this._topic,msg);
	}
	public get topic():string{
		return this._topic;
	}
}

export abstract class View<T> extends Observable {
	private static version: number = 0;
	protected constructor(name:string){
		super(name+"Version#"+View.version.toString(32));
		++View.version;
	}
	public fireIntent(event:IntentEvent, newState: T){
		this.notify(new MVPEvent<T>(event as IntentEvent | StateChangeEvent,newState));
	}
	public abstract render(): void;
	public abstract handleStateChange(event:StateChangeEvent,newState: T):void;
}

export abstract class Model<T> extends Observable {
	private static version: number = 0;
        protected constructor(name:string){
                super(name+"Version#"+Model.version.toString(32));
                ++Model.version;
        }
	public fireStateChange(event: StateChangeEvent, newState: T){
		this.notify(new MVPEvent<T>(event as IntentEvent | StateChangeEvent,newState));
	}
	public abstract getState():T;
	public abstract handleIntent(event:IntentEvent, newState: T):void;
}

export class Presenter<T, V extends View<T>,M extends Model<T>> {
	protected _view!: V;
	protected _model!: M;

	protected get view(): V {
    		return this._view;
  	}

  	protected get model(): M {
    		return this._model;
  	}
	public attach(view: V, model: M): void {
		this._view = view;
		this._model = model;
		Broker.getInstance().subscribe(this._view.topic,this.updateModel);
		Broker.getInstance().subscribe(this._model.topic,this.updateView);
	}
	public detach(){
		Broker.getInstance().unsubscribe(this._view.topic,this.updateModel);
                Broker.getInstance().unsubscribe(this._model.topic,this.updateView);
	}
	public updateModel(msg:any):void{
		if(msg instanceof MVPEvent && msg.isIntent()){
			this._model.handleIntent(msg.event as IntentEvent,msg.state);	
		}		
	}
	public updateView(msg:any):void{
		if(msg instanceof MVPEvent && msg.isStateChange()){
			this._view.handleStateChange(msg.event as StateChangeEvent,msg.state);
		}
	}
}
