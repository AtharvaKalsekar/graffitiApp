import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SHA256, enc } from "crypto-js";
import { UserService } from '../user.service';
import { GlobalDataService } from '../global-data.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";

import { AlertService } from '../alert.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(private userService:UserService,private spinner: NgxSpinnerService,private alertService:AlertService,private global:GlobalDataService,private router:Router) { }

  allowSignup=false;
  allowSignupPassword=false;
  allowSignupFirstName=false;
  allowSignupLastName=false;
  allowSignupUsername=false;
  form = new FormGroup({
    username : new FormControl('',Validators.required),
    password : new FormControl('',Validators.required),
    firstName : new FormControl('',Validators.required),
    lastName : new FormControl('',Validators.required),
    department : new FormControl('',Validators.required),
  });

  department="COED";
  ngOnInit() {
  }


  setDepartment(v){
    this.department=v;
  }

  checkPassword()
  {
    let password=this.form.get('password').value;
    if(password.length==0)return;
    if(password.length<7||password.length>20)
    {
      this.alertService.error("Enter a password with length between 7 and 20.");
      this.allowSignupPassword=false;
      return;
    }
    this.alertService.info("good password bruh!")
    this.allowSignupPassword=true;
  }

  checkFirstName()
  { 
    let firstName=this.form.get('firstName').value;
    if(firstName.length==0)return;
    if(firstName.length<3||firstName.length>15)
    {
      this.alertService.error("Sorry for your unfortunate first name :( But we only accept ones with length between 3 and 15! :)");
      this.allowSignupFirstName=false;
      return;
    }
    let firstNameLen=firstName.length;
    for(let i=0;i<firstNameLen;i++)
    {
      if((firstName[i]>='a'&&firstName[i]<='z')||(firstName[i]>='A'&&firstName[i]<='Z'))
      {
        continue;
      }
      this.alertService.error("Unless you are Elon Musk's son, you are only allowed to have alphabets in your name");
      this.allowSignupFirstName=false;
      return;
    }

    this.allowSignupFirstName=true;
  }

  checkLastName()
  { 
    let lastName=this.form.get('lastName').value;
    if(lastName.length==0)return;
    if(lastName.length<3||lastName.length>15)
    {
      this.alertService.error("Sorry for your unfortunate last name :( But we only accept ones with length between 3 and 15! :)");
      this.allowSignupLastName=false;
      return;
    }
    let lastNameLen=lastName.length;
    for(let i=0;i<lastNameLen;i++)
    {
      if((lastName[i]>='a'&&lastName[i]<='z')||(lastName[i]>='A'&&lastName[i]<='Z'))
      {
        continue;
      }
      this.alertService.error("Unless you are Elon Musk's son, you are only allowed to have alphabets in your name");
      this.allowSignupLastName=false;      
      return;
    }

    this.allowSignupLastName=true;
  }


  checkUsername(){
    let username=this.form.get('username').value;
    if(username.length==0)return;
    let usernameLen=username.length;
    if(usernameLen<6)
    {
      this.alertService.error("We have enough space in our db! Please enter a username greater than 6 characters");
      this.allowSignupUsername=false;
      return;
    }
    if(usernameLen>20)
    {
      this.alertService.error("Having a long username won't give you higher marks. Please restrict to 20 characters");
      this.allowSignupUsername=false;      
      return;
    }
    for(let i=0;i<usernameLen;i++)
    {
      if(username[i]=='_')
      continue;
      if(username[i]>='a'&&username[i]<='z')
      {
        continue;
      }
      if(username[i]>='A'&&username[i]<='Z')
      {
        continue;
      }
      if(username[i]>='0'&&username[i]<='9')
      {
        continue;
      }
      this.alertService.error("Bahut tez ho rahe ho hain? Alphanumeric and underscores(_) only! :) ");
      this.allowSignupUsername=false;      
      return;
    }
    this.allowSignupUsername=true;
    this.userService.checkUser({"userId":username}).subscribe((data)=>{
        if(!data.action && username!=" "){
          console.log(data.message);
          this.allowSignup=false;
          this.alertService.error(data.message); 
        }
        else{
          console.log(data.message);
          this.allowSignup=true;
          if(username!=" "){
            this.alertService.info(data.message);
          }
          
        }
      })
    
  }

  signup(){
    this.spinner.show();
    this.checkFirstName();
    this.checkLastName();
    this.checkPassword();
    this.checkUsername();
    let username=this.form.get('username').value;
    let firstName=this.form.get('firstName').value;
    let lastName=this.form.get('lastName').value;
    let password=this.form.get('password').value;
    if(!this.allowSignupFirstName || !this.allowSignupLastName
      || !this.allowSignupLastName || !this.allowSignupUsername)return;
    const hashedPass = SHA256(password).toString(enc.Hex);
    console.log("in signup");
    this.userService.createUser({"userId":username,"firstName":firstName,"lastName":lastName,"password":hashedPass,"department":this.department}).subscribe(data=>{
      if(!data.action){
        this.spinner.hide();
        this.alertService.error(data.message);
      }
      else{
        let username=data.message.user.userId;
        localStorage.setItem("user",JSON.stringify(data.message.user));
        localStorage.setItem("loggedInUsername",username);        
        localStorage.setItem("access_token",data.message.token);
        this.router.navigate(['/dashboard/'+username]);
        this.spinner.hide();
        this.alertService.success("you have been registered !!");
      }
    })
  }

}
