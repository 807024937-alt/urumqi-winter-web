export const statuses=['待确认','需提前处理','已确认','已完成'];
export const uid=()=>crypto.randomUUID();
export type Item={id:string;[key:string]:any};
export type Plan={trip:Item;days:Item[];flights:Item[];stays:Item[];transport:Item[];budget:Item[];tasks:Item[];facts:Item[];cold:Item[]};
