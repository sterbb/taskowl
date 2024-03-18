import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainpageService {

  constructor(private http: HttpClient) { }

  baseUrl: string = "http://localhost/api/";
  org: string = "1";

  getProjects(id: any) {
    console.log(this.org);
      // return this.http.get(this.baseUrl+'get.project.php');
      return this.http.get<any[]>(this.baseUrl+'get.project.php?id=' + id);

      // return this.http.get<TestData[]>(this.baseUrl+'view.php?id=' +org);
  }

  getTasks(id: any, projectId: any) {
    // Construct the URL with both parameters
    const url = `${this.baseUrl}get.task.php?id=${id}&projectId=${projectId}`;

    // Make the HTTP GET request with the constructed URL
    return this.http.get<any[]>(url);
  }

  createTask(data: any){
    return this.http.post(this.baseUrl+'put.task.php', data);
  }

  logTimeTrack(data: any){
    return this.http.post(this.baseUrl+'put.timelog.php', data);
  }

  logAppsUsed(data:any){
    return this.http.post(this.baseUrl+'put.applog.php', data);
  }

  updateTaskComplete(data:any){
    return this.http.put(this.baseUrl+'put.updatetask.php', data)
  }




  // register(user: User) {
  //     return this.http.post(`/users/register`, user);
  // }


}
