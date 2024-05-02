import { Component } from '@angular/core'; 
import { ElectronService } from '../core/services';
import { MainpageService } from '../core/services/main.service';
import { SharedService } from '../core/services/shared.service';
import { Router } from '@angular/router';
import { Console } from 'console';
import { resolve } from 'path';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent {

  constructor(private mainPage:MainpageService, private router: Router, private electronService:ElectronService, private sharedService: SharedService) {
    
  }

  seconds: number = 0;
  startTime: any;
  endTime: any;
  timerTime: string = "00:00:00";
  timer: any;
  tasks: any[] = [];
  id: string = '';
  user_org: string = '';
  listoftasks: any[] = [];
  allTasks: any[] = [];
  project_text: string = "No Task Selected";

  selectedProject!: { project_id: string; project_name: string; };
  selectedTask!: { task_id: string; task_name: string; project_name:string; project_id:string;};

  timeData: any = {}; // Initialize formData as an empty object
  taskData: any = {}; // Initialize formData as an empty object

  ngOnInit(): void {
 
    this.sharedService.data$.subscribe(   
      async data => {

        this.id = data.user_id; 

        await this.fetchAllTask();

        
        if(data.task_id != null){
          const currentTask = {task_id: data.task_id, task_name: data.task_name};
          const matchTask = this.listoftasks.find(listoftask=>listoftask.task_id == currentTask.task_id && listoftask.task_name == currentTask.task_name);
          this.project_text = data.project_name;
          this.selectedTask = matchTask;
        }

        
        if(data.seconds > 0){

          if(data.seconds != null){
            this.seconds = data.seconds;
           

            const stopbtn = document.getElementById('stop');
            const startbtn = document.getElementById('start')

            if(stopbtn && startbtn){
              stopbtn.style.display = '';
              startbtn.style.display = 'none';
            }
          }

          this.startTime = data.startTime;
        

          this.timer = setInterval(() => {
            this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerTime = this.sharedService.formatTime(this.seconds);
          }, 1000)


        }

      }
    )


    



    if(this.seconds > 0){
      console.log("jfl;aksejf")
      
    }


    this.electronService.ipcRenderer.on('main', (event, wid_data) => {

      
      if(wid_data == 'open'){

      
        this.router.navigate(['/home']);

      }
      // Handle the 'widget' message as needed
    });

  

  }

  minimize(){
    this.sharedService.minimize('open-main');
  }

  async fetchAllTask():Promise <void>{
    
    return new Promise((resolve,reject)=>{
      this.mainPage.getTasks(this.id, '').subscribe(
        (data: any) =>{
          console.log(data)
          this.listoftasks = data.data;
          this.allTasks = data.data;
          resolve();
        } 
      )
    })

  }

  trackTime(){
    this.startClock();
  }

  startClock(){

    this.electronService.ipcRenderer.send('start-track')

    const startbtn = document.getElementById('start');
    const stopbtn = document.getElementById('stop');

    this.startTime = Date.now() - (this.endTime - this.startTime || 0);
    
    if (startbtn && stopbtn) {
      stopbtn.style.display = '';
      startbtn.style.display = 'none';
    }


    if (!this.timer) {

      this.timer = setInterval(() => {
        this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.timerTime = this.sharedService.formatTime(this.seconds);
      }, 1000);

    }

  }

  async stopTrackTime():Promise<void> {
    this.stopClock();
    await this.getAppUsed();
    await this.getCurrentTaskData();




    const stopbtn = document.getElementById('stop');
    const startbtn = document.getElementById('start');

    if (stopbtn && startbtn) {
      stopbtn.style.display = 'none';
      startbtn.style.display = '';
    }
    
    // time for the task 
    this.seconds = 0;
    // this.pausedSeconds = 0; // Reset pausedSeconds
    this.timerTime = '00:00:00';
    // this.currentDateTimeDisplay.innerText = 'Current Date and Time: ';

    this.startTime = null;
    this.endTime = null;
    this.timeData = {};
    clearInterval(this.timer);


  }

  stopClock(){
    if (this.timer) {
      this.endTime = Date.now();
      this.startTime = Math.floor(this.startTime / 1000);
      this.endTime = Math.floor(this.endTime / 1000);
      this.electronService.ipcRenderer.send('stop-track');

    }

  }

  async getAppUsed(): Promise<void>{
    return new Promise((resolve, reject) => {
      this.electronService.ipcRenderer.once('time-track-stopped', async (event,apps,idle)=>{
        this.timeData.apps_used = apps;
        this.timeData.idle_time = idle;
        resolve();
      })  
    });
   

  }

  async getCurrentTaskData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeData.user_id = this.id;
      this.timeData.user_org = this.user_org;
      this.timeData.start_time = this.startTime;
      this.timeData.end_time = this.endTime;
      this.timeData.total_time = this.timerTime;
      this.timeData.project_id = this.selectedTask.project_id;
      this.timeData.project_name = this.selectedTask.project_name;
      this.timeData.task_id = this.selectedTask.task_id;
      this.timeData.task_name = this.selectedTask.task_name;
  
  
      console.log(this.timeData)
      // this.mainPage.logTimeTrack(this.timeData).subscribe(
      //   (data:any) =>{  
      //     this.listoftasks.forEach(task => {
      //       if (task.task_id === this.selectedTask.task_id) {
      //           task.total_spent = data.total;
      //       }
      //     });
      //   },  
      //   error =>{
      //     console.log(error);
      // });

      resolve();
    });

  }



  fillProject(){
    this.project_text = this.selectedTask.project_name;
  }

  ngAfterViewInit() {



  }

  

  
}
