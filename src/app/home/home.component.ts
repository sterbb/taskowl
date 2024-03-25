import { Component, OnInit } from '@angular/core';
import { MainpageService } from '../core/services/main.service';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services';
import { ipcMain, ipcRenderer } from 'electron';
import { timeStamp } from 'console';

import * as moment from  'moment-timezone';
import { convertCompilerOptionsFromJson } from 'typescript/lib/tsserverlibrary';
import { stat } from 'fs';


@Component({
  selector: 'app-default',
  templateUrl: './home2.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  projects: any[] = [];
  tasks: any[] = [];
  listoftasks: any[] = [];
  selectedProject!: { project_id: string; project_name: string; };
  selectedTask!: { task_id: string; task_name: string; };
  selectedTimeZone: any = "Asia/Manila";
  companyTimeZone :any;
  currentTimeZone: any;
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
  listTimeZones: any;
  bookmark_link:any;

  placeholderText: string = "Hlsd";



  selectedStatus: any = 'O';
  selectedTab: any = 'active';



  timeData: any = {}; // Initialize formData as an empty object
  taskData: any = {}; // Initialize formData as an empty object




  constructor(private mainPage:MainpageService, private router: Router, private electronService:ElectronService) {
  }

  ngOnInit(): void {

    this.populateTimezone();

    this.fetchProject();
    this.fetchAllTask();
    this.getTimeAndDay();

    setInterval(this.getTimeAndDay, 1000)

  }

  populateTimezone():void{
    this.listTimeZones = moment.tz.names();
  }


  getTimeAndDay(){
    this.fetchTimezone();
    // Get the current date
    const currentDate: Date = new Date(this.companyTimeZone);


    // Options for formatting the date
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short', // Short month name (e.g., "MAR")
        day: '2-digit' // Two-digit day (e.g., "16")
    };

    // Format the date
    const formattedDate: string = currentDate.toLocaleDateString('en-US', options).toUpperCase(); // Convert to uppercase



    // Use the formatted date in your HTML
    const paragraphElement: HTMLElement | null = document.querySelector('#date-today');
    if (paragraphElement) {
        paragraphElement.textContent = formattedDate;
    }

      // Get hours, minutes, and AM/PM
      let hours: number = currentDate.getHours();
      const minutes: number = currentDate.getMinutes();
      const ampm: string = hours >= 12 ? 'P.M.' : 'A.M.';
  
      // Convert hours to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // Handle midnight (12:00 A.M.)
  
      // Add leading zeros to minutes if necessary
      const formattedMinutes: string = minutes < 10 ? '0' + minutes : minutes.toString();
  
      // Format the time string
      const formattedTime: string = `${hours}:${formattedMinutes} ${ampm}`;
  
      // Use the formatted time in your HTML
      const time: HTMLElement | null = document.querySelector('#time-today');
      if (time) {
        time.textContent = formattedTime;
      }



      // Get current day (0-6, where 0 is Sunday and 6 is Saturday)
      const currentDay: number = currentDate.getDay();
  
      // Array of day names
      const dayNames: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
      // Get day name
      const currentDayName: string = dayNames[currentDay].substring(0,3);

      // Use the formatted time in your HTML
      const day: HTMLElement | null = document.querySelector('#datename-today');
      if (day) {
        day.textContent = currentDayName;
      }
      
      

  }

  
  fetchTimezone(){
    this.companyTimeZone =  moment().tz(this.selectedTimeZone).format()
  }

  fetchProject():void{
    this.mainPage.getProjects(this.user_org).subscribe(
      (data: any) =>{
 
        this.projects = data.data;
        console.log(data.data)
      } 
    )
  }

  async fetchTask(): Promise<void>{

      return new Promise((resolve, reject) => {
      this.mainPage.getTasks(this.id, this.selectedProject.project_id).subscribe(
        (data: any) =>{
          console.log(data)
          this.tasks = data.data;
          resolve();
        } 
      )
    });
  }

  fetchAllTask():void{
    this.mainPage.getTasks(this.id, '').subscribe(
      (data: any) =>{
        console.log(data)
        this.listoftasks = data.data;
      
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

  async stopTrackTime():Promise<void> {
    this.stopClock();
    await this.getAppUsed();
    await this.getCurrentTaskData();



    const pausebtn = document.getElementById('pause');
    const stopbtn = document.getElementById('stop');
    const startbtn = document.getElementById('start');

    if (stopbtn !== null && pausebtn !== null && startbtn !== null ) {
      stopbtn.style.display = 'none';
      pausebtn.style.display = 'none';
      startbtn.style.display = '';
    }
    
    this.seconds = 0;
    // this.pausedSeconds = 0; // Reset pausedSeconds
    this.timerTime = '00:00:00';
    // this.currentDateTimeDisplay.innerText = 'Current Date and Time: ';

    this.seconds = 0;
    this.isStart = false;
    this.startTime = null;
    this.endTime = null;
    this.timeData = {};
    clearInterval(this.timer);


  }

  startClock(){

    this.electronService.ipcRenderer.send('start-track')

    const pausebtn = document.getElementById('pause');
    const stopbtn = document.getElementById('stop');
    const startbtn = document.getElementById('start');

    this.startTime = Date.now() - (this.endTime - this.startTime || 0);
    
    if (stopbtn !== null && pausebtn !== null && startbtn !== null ) {
      stopbtn.style.display = '';
      pausebtn.style.display = '';
      startbtn.style.display = 'none';
  }


    if (!this.timer) {

      this.timer = setInterval(() => {
        this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.timerTime = this.formatTime(this.seconds);
      }, 1000);

      //diri ga resume?
      const pausebtn = document.getElementById('pause');
      if (pausebtn !== null) {
        pausebtn.style.backgroundColor =  '#0d6efd';
        pausebtn.style.borderColor = '#0d6efd'
      }

    }else{

      const pausebtn = document.getElementById('pause');
      if (pausebtn !== null) {
        pausebtn.style.backgroundColor =  '#0d6efd';
        pausebtn.style.borderColor = '#0d6efd'
      }
      this.resumeClock();

    }

    this.isStart = true;
  }

  pauseClock(){
    clearInterval(this.timer);
    this.endTime = Date.now();
    this.isStart = false;
    this.timer = null;
    this.electronService.ipcRenderer.send('pause-track')

    const pausebtn = document.getElementById('pause');
    if (pausebtn !== null) {
      pausebtn.style.backgroundColor =  '#4DA464';
      pausebtn.style.borderColor =  '#4DA464';
    }
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


      this.startTime = Math.floor(this.startTime / 1000);
      this.endTime = Math.floor(this.endTime / 1000);
      this.pauseClock(); // Stop the timer
      this.getTimeZone();

      this.electronService.ipcRenderer.send('stop-track');

    }

  }

  async getCurrentTaskData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeData.user_id = this.id;
      this.timeData.user_org = this.user_org;
      this.timeData.start_time = this.startTime;
      this.timeData.end_time = this.endTime;
      this.timeData.total_time = this.timerTime;
      this.timeData.timezone = this.timeZone;
      this.timeData.project_id = this.selectedProject.project_id;
      this.timeData.project_name = this.selectedProject.project_name;
      this.timeData.task_id = this.selectedTask.task_id;
      this.timeData.task_name = this.selectedTask.task_name;
  
  
      console.log(this.timeData)
      this.mainPage.logTimeTrack(this.timeData).subscribe(
        (data:any) =>{  
          this.listoftasks.forEach(task => {
            if (task.task_id === this.selectedTask.task_id) {
                task.total_spent = data.total;
            }
          });
        },  
        error =>{
          console.log(error);
      });

      resolve();
    });

  }

  async getAppUsed(): Promise<void>{
    return new Promise((resolve, reject) => {
      this.electronService.ipcRenderer.once('time-track-stopped', async (event,apps,idle)=>{

        this.timeData.apps_used = apps;

        this.timeData.idle_time = this.formatTime(idle);

        console.log("Total Idle Time: " + this.timeData.idle_time);
        resolve();
      })  
    });
   

  }

  formatTime(seconds: number): string {

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

  openLink(event: MouseEvent, linkElement: HTMLAnchorElement) {
    event.preventDefault(); // Prevents the default behavior of the link
    const hrefValue = linkElement.href;
    this.electronService.ipcRenderer.send('openLink', hrefValue)
    // You can perform further actions here
  }

  changeStatus(tab: string) {
    this.selectedStatus = tab;

    console.log('ajflk;asejf')

    if(tab == 'O'){
      this.selectedTab = 'active'
    }else{
      this.selectedTab = 'archived'
    }

    console.log(this.selectedStatus + this.id);

    this.mainPage.getTasksStats(this.id, this.selectedStatus).subscribe(
      (data:any) =>{  
       this.listoftasks = data.data;
       console.log(data)
      },  
      error =>{
        console.log(error);
    });


  }

  async selectTask(p_id: any, p_name: any, t_id: any, t_name: any){
 
    const play_project = {project_id: p_id, project_name:p_name}
    const matchedProject = this.projects.find(project=>project.project_id == play_project.project_id && project.project_name == play_project.project_name);
    this.selectedProject = matchedProject;

    await this.fetchTask()

    const play_task = {task_id: t_id, task_name:t_name}
    const matchedTask= this.tasks.find(task=>task.task_id == play_task.task_id && task.task_name == play_task.task_name);
    this.selectedTask = matchedTask;

    this.trackTime()

  }

  async completeTask(t_id: any){
    this.taskData.user_id = this.id;
    this.taskData.task_id = t_id;

    console.log(this.taskData)
    this.mainPage.updateTaskComplete(this.taskData).subscribe(
      (data:any) =>{  
        console.log(data)
      },  
      error =>{
        console.log(error);
    });

  }

  

  searchTask(){
    console.log("jflakseljkjes")
    const hide_text = document.getElementById('available_task_test');
    const searchInput = document.getElementById('searchInput');
    

    if (hide_text !== null && searchInput !== null) {
      hide_text.style.display = 'none';
      searchInput.style.display = '';
    }
  }

  showBookmark(status: string){
    const bookmarkDiv = document.getElementById('bookmark-div');
    const bookmarkItems = document.getElementById('bookmark-items-div');



    if(bookmarkDiv !== null && bookmarkItems !== null) {
      if(status === 'show'){
        bookmarkDiv.classList.toggle('show');
        bookmarkItems.classList.toggle('show-container');

      }else{
        bookmarkDiv.classList.remove('show');
        bookmarkItems.classList.remove('show-container');
      }
    } else {
      console.error("Element with ID 'bookmark-div' not found.");
    }
  }



  ngAfterViewInit() {
  }


}
