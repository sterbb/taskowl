import { Component, OnInit } from '@angular/core';
import { MainpageService } from '../core/services/main.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-default',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  projects: any[] = [];
  tasks: any[] = [];
  selectedProject!: { id: string; name: string; };
  selectedTask!: { id: string; name: string; };
  taskName!: string;
  // user_org = localStorage.getItem("user_org");
  // id = localStorage.getItem("id");
  user_org = "1";
  id = "1";
  isStart: boolean = false;
  timer:any;
  timerTime: string = "00:00:00";
  startTime: any;
  endTime: any;
  seconds: number = 0;
  timeZone: any;
  


  timeData: any = {}; // Initialize formData as an empty object




  constructor(private mainPage:MainpageService, private router: Router) {
  }

  ngOnInit(): void {
    console.log(this.user_org);
    this.fetchProject();
  }

  fetchProject():void{
    this.mainPage.getProjects(this.user_org).subscribe(
      (data: any) =>{
        console.log(data.data);
        this.projects = data.data;
      } 
    )
  }

  fetchTask():void{
    console.log(this.id + "hekej" + this.selectedProject.id)
    this.mainPage.getTasks(this.id, this.selectedProject.id).subscribe(
      (data: any) =>{
        console.log(data);
        this.tasks = data.data;
      } 
    )
  }

  createTask():void{
  
    const data = {
      selectedProject: this.selectedProject,
      taskName: this.taskName,
      id: this.id
    };

    this.mainPage.createTask(data).subscribe(
      (data:any)=>{
        alert('Data is added successfully!');

        
        this.fetchTask();
      },
      error=>{
        console.log(error);
        alert(error);
      });
  }

  trackTime():void {
    this.isStart = !this.isStart;


      if (this.isStart) {
          this.startClock();
      } else {
          this.pauseClock();
      }

  }

  stopTrackTime():void {
    this.stopClock();

    console.log(this.timeData);
    this.seconds = 0;
    // this.pausedSeconds = 0; // Reset pausedSeconds
    this.timerTime = '00:00:00';
    // this.currentDateTimeDisplay.innerText = 'Current Date and Time: ';

    this.seconds = 0;
    this.isStart = false;
    this.startTime = null;
    this.endTime = null;

    this.mainPage.logTimeTrack(this.timeData).subscribe(
      (data:any) =>{  
        console.log(data)
      
      },
      error =>{
        console.log(error);
    });
      
    clearInterval(this.timer);


  }

  startClock(){
    this.startTime = Date.now() - (this.endTime - this.startTime || 0);

    if (!this.timer) {

      this.timer = setInterval(() => {
        this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.timerTime = this.formatTime(this.seconds);
        console.log(this.timerTime)
      }, 1000);

    }else{

      this.resumeClock();
    }

    this.isStart = true;
  }

  pauseClock(){
    clearInterval(this.timer);
    this.endTime = Date.now();
    this.isStart = false;
    this.timer = null;
  }

  resumeClock(){
    if(!this.timer){
      this.timer = setInterval(() => {
        this.seconds++;
        const formattedTime = this.formatTime(this.seconds);
        this.timerTime = formattedTime;
      }, 1000);
    }

  }

  stopClock(){
    if (this.timer) {
      this.endTime = Date.now();
      console.log(this.endTime);

      this.startTime = Math.floor(this.startTime / 1000);
      this.endTime = Math.floor(this.endTime / 1000);
      this.pauseClock(); // Stop the timer
      this.getTimeZone();

      this.timeData.user_id = this.id;
      this.timeData.user_org = this.user_org;
      this.timeData.start_time = this.startTime;
      this.timeData.end_time = this.endTime;
      this.timeData.total_time = this.timerTime;
      this.timeData.timezone = this.timeZone;
      this.timeData.project_id = this.selectedProject.id;
      this.timeData.project_name = this.selectedProject.name;
      this.timeData.task_id = this.selectedTask.id;
      this.timeData.task_name = this.selectedTask.name;


    }

  }

  formatTime(seconds: number): string {

    console.log(seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  getTimeZone(){
    const date = new Date();
    const utcOffsetInMinutes = date.getTimezoneOffset();
    // Convert the offset to hours and minutes
    const hoursOffset = Math.floor(Math.abs(utcOffsetInMinutes) / 60);
    const minutesOffset = Math.abs(utcOffsetInMinutes) % 60;
    // Determine the sign of the offset
    const offsetSign = utcOffsetInMinutes >= 0 ? '-' : '+';
    // Construct the UTC offset string
    const utcOffsetString = `${offsetSign}${hoursOffset.toString().padStart(2, '0')}`;
    this.timeZone = utcOffsetString;

  }

  pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  logout() {


  
      localStorage.clear();
      console.log("yie logout")
      this.router.navigate(['/login']);
    }

  

  ngAfterViewInit() {
  }
}
