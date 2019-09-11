import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wim-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public toggleSidebar(){
    // //should allow sidebar to go in and come back out
    // var sidebar = document.getElementById("wimSidebar");
    // if (sidebar.style.display === "none") {
    //     sidebar.style.display = "block";
    // } else {
    //     sidebar.style.display = "none";
    // }
  } 
}
