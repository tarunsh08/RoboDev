import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;


export const getWebContainer = async () => {
    if(webContainerInstance === null){
        webContainerInstance = await WebContainer.boot();
    }
    return webContainerInstance;
}