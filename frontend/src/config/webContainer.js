import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;


export const getWebContainer = () => {
    if(webContainerInstance === null){
        webContainerInstance = new WebContainer();
    }
    return webContainerInstance;
}