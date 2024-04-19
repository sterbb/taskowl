import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { ElectronService } from './electron/electron.service';

@Injectable({
    providedIn: 'root'
})

export class SharedService {

    constructor( private electronService:ElectronService) {
    }
    // Create a Subject to hold data
    private dataSubject = new BehaviorSubject<any>(null);
    
    
    // Observable for components to subscribe to
    data$ = this.dataSubject.asObservable();

    // Method to send data
    sendData(data: any) {
        this.dataSubject.next(data);
        console.log(this.dataSubject)
    }

    close(){
        this.electronService.ipcRenderer.send('close', true)
    }

    minimize(data:string){
        this.electronService.ipcRenderer.send('minimize', data)
    }

    // Define any other methods or data you want to share between components
    sharedFunction() {
        // Implement shared logic here
    }

    formatTime(seconds: number): string {

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
    }

    pad(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }
    
}