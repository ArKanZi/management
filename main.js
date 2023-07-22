
let database = (function(){
    // Init Firebase

    var firebaseConfig = {
        apiKey: "AIzaSyDP6rkmXlhvjjCHDmsjXJFe-nDqNxoufTo",
        authDomain: "student-details-manager.firebaseapp.com",
        databaseURL: "https://student-details-manager.firebaseio.com",
        projectId: "student-details-manager",
        storageBucket: "student-details-manager.appspot.com",
        messagingSenderId: "1013627993358",
        appId: "1:1013627993358:web:224f91d69a20def2c86b5f"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore()

    // Database references
    let studentDatabase = db.collection('Student') ;
    let teacherDatabase = db.collection('Teacher') ;

    // Other Functions

    function requestData(year,callback){
        studentDatabase.where("year","==",year).get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                callback(doc.data());
            });
        });
    }

    function getTeachers(callback){
        teacherDatabase.get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                callback(doc.data());
            });
        });
    }

    function requestStudent(id,callback){
        studentDatabase.doc(id).get().then((snapshot) => {
            callback(snapshot.data());
        }).catch(msg => console.error(msg));
    }

    function deleteStudent(id) {
        studentDatabase.doc(id).delete().then((snapshot) => {
            alert("Student Data Has been Deleted") ;
        }).catch(msg => console.error(msg));
    }

    function setStudent(name,rollNumber,enrollmentNumber,mobile,email,gender,department,semester,dob,year) {
        let data = {name,rollNumber,enrollmentNumber,mobile,email,gender,department,semester,dob,year} ;
        studentDatabase.doc(enrollmentNumber).set(data).then(result => {
            console.log(result) ;
        }).catch(result => {
            console.error(result) ;
        });
    }
    
    return {
        getAllStudents : function(year,callback){
            requestData(year,callback);
        } ,
        getStudent : function(id,callback) {
            requestStudent(id,callback);
        } ,
        deleteStudent : function(id) {
            deleteStudent(id) ;
        } ,
        addStudent : setStudent ,
        getTeachers : getTeachers 
    };

})(); 


let appPageManager = (function(){

    let activePage ;

    function hidePage(){
        pageElement = activePage ;
        if(!activePage) return ;
        pageElement.setAttribute("data-page-state","hidden") ;
    }

    function showPage(pageElement){
        if(activePage === pageElement) return ;
        hidePage();
        pageElement.setAttribute("data-page-state","show");

        let animationEndEventHandler = (event) => {
            // console.log("Show Animation Ended",event);
            event.target.setAttribute("data-page-state","visible") ;
            event.target.removeEventListener("webkitAnimationEnd",animationEndEventHandler);
        };
        pageElement.addEventListener("webkitAnimationEnd",animationEndEventHandler);
        activePage = pageElement ;
    }

    // Return Interface
    return {
        remove : function(){removeTopPage();} ,
        add : function(pageElement){addPage(pageElement);} ,
        show : function(pageElement){showPage(pageElement);} ,
        hide : function(pageElement){hidePage(pageElement);}
    }

})();


(function () {
    "use strict";
  
    var TableFilter = (function () {
      var search;
      function query(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      }
  
      function onInputEvent(e) {
        var input = e.target;
        search = input.value.toLocaleLowerCase();
        var selector = input.getAttribute("data-table") + " tbody tr";
        var rows = query(selector);
  
        [].forEach.call(rows, filter);
        var writer = input.getAttribute("data-count");
        if (writer) {
          var count = rows.reduce(function (t, x) { return t + (x.style.display === "none" ? 0 : 1); }, 0);
        }
      }
  
      function filter(row) {
        if (row.lowerTextContent === undefined)
          row.lowerTextContent = row.textContent.toLocaleLowerCase();
        row.style.display = row.lowerTextContent.indexOf(search) === -1 ? "none" : "table-row";
  
        if(row.getAttribute("data-visible")=="true") row.style.display = "table-row" ;
      }
  
      return {
        init: function () {
          var inputs = query("input[data-table]");
          [].forEach.call(inputs, function (input) {
            input.oninput = onInputEvent;
            if (input.value !== "") input.oninput({ target: input });
          });
        }
      };
  
    })();
  
    TableFilter.init();
  })();

  
let bodyElement  ;
let currentStudentId = NaN ;

window.onload = () => {
    bodyElement = document.querySelector("body") ;

    var user = firebase.auth().currentUser ;
    if (user) {
        console.log(user);
        loginPage.classList.add("hide");
    } else {
        loginPage.classList.remove("hide") ;
    }

    loginPageLoginButton.addEventListener("click",() => {
        let username = loginPageUsername.value ;
        let password = loginPagePassword.value ;
        firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
            console.error(error);
        });
    });

    logoutButton.addEventListener("click",() => {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
          }).catch(function(error) {
            // An error happened.
          });
    })


    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user);
            loginPage.classList.add("hide");
        } else {
            loginPage.classList.remove("hide") ;
        }
    });

    dashboardButton.addEventListener("click",()=>{appPageManager.show(dashboard)});
    studentButton.addEventListener("click",()=>{appPageManager.show(student)});
    facultyButton.addEventListener("click",()=>{appPageManager.show(teacher); showTeachers();});
    examButton.addEventListener("click",()=>{appPageManager.show(exam)});
    profileButton.addEventListener("click",()=>{appPageManager.show(profile)});
    settingsButton.addEventListener("click",()=>{appPageManager.show(settings)});
    aboutUsButton.addEventListener("click",()=>{appPageManager.show(aboutUs)});
    addStudentButton.addEventListener("click",()=>{appPageManager.show(addStudentPage)});
    closeStudentButton.addEventListener("click",()=>{appPageManager.show(student)});
    closeStudentProfileButton.addEventListener("click",()=>{appPageManager.show(student)});

    saveNewStudentButton.addEventListener("click",addStudent) ;
    
    deleteStudentButton.addEventListener("click",()=>{
        let result = confirm("Are you sure you want to delete " + currentStudentId);
        if(result == true){
            database.deleteStudent(currentStudentId);
            document.querySelector(`[data-id="${currentStudentId}"`).remove();
            appPageManager.show(student);
        }

    }) ;


    appPageManager.show(dashboard);

    studentYear.addEventListener("input",()=>{
        studentQueryResult.innerHTML = `
        <tr data-visible="true">
            <th>Enroll</th>
            <th>Image</th>
            <th>Name</th>
            <th>Roll No</th>
            <th>Date of Birth</th>
        </tr>
        ` ;
        database.getAllStudents(studentYear.value, student => {
            renderData(student.enrollmentNumber,student.name,student.rollNumber,student.dob);
        });
    })
    
};

function showTeachers(){
    teacherQueryResult.innerHTML = `
        <tr data-visible="true">
            <th>Serial</th>
            <th>Image</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Date of Birth</th>
        </tr>
    ` ;
    database.getTeachers(teacher => {
        renderTeacherData(teacher);
    });
}

function colorize(){
    let imgs = document.querySelectorAll("td img");
    imgs.forEach(img => {
        img.style.filter = `hue-rotate(${Math.random()*360}deg)` ;
    });
}

function getFlag(flag){
    return bodyElement.getAttribute(flag) ;
}

function setFlag(flag,value){
    bodyElement.setAttribute(flag,value);
}

function toggleNav(){
        setFlag("data-nav-state", (getFlag("data-nav-state") == "open"?"closed":"open")) ;
}

function setTab(index) {
    let tabBtn = document.querySelectorAll("#studentProfileTabView .tab") ;
    tabBtn.forEach(tab => tab.classList.remove("active-tab")) ;
    tabBtn[index].classList.add("active-tab") ;

    let tabPagesScroll = document.querySelectorAll("#studentProfileTabView .tab-page") ;
    tabPagesScroll.forEach(tab => tab.classList.remove("active-tab-page")) ;

    tabPagesScroll[index].classList.add("active-tab-page"); 
}

function openProfile(id){
    database.getStudent(id,(student) => {
        console.log(student) ;
        if(!student) return ;
        currentStudentId = student.enrollmentNumber ;
        studentProfileName.innerHTML = student.name ;
        studentProfileRollNo.innerHTML = student.rollNumber ;
        studentProfileDepartment.innerHTML = student.department ;
        studentProfileSemester.innerHTML = student.year + " Year | " + student.semester + " Semester";
        studentProfileEnrollment.innerHTML = student.enrollmentNumber ;
        studentProfileDob.innerHTML = student.dob ;
        studentProfileGender.innerHTML = student.gender ;
        studentProfileEmail.innerHTML = student.email ;
        studentProfilePhone.innerHTML = student.mobile ;
        editBtn.setAttribute("data-id",student.enrollmentNumber) ;
    });

    appPageManager.show(studentProfile);
}

function formateDate(dateObj){
    let dateArray = dateObj.toString().split(" ");
    return dateArray[2] + " " + dateArray[1] + " " + dateArray[3] ;
}

function renderData(enroll,name,rollNo,dob){
    let template = 
    `<tr data-id="${enroll}" onclick="openProfile('${enroll}')">
        <td>${enroll}</td>
        <td><img src="https://firebasestorage.googleapis.com/v0/b/student-details-manager.appspot.com/o/profile.png?alt=media&token=6ad1a772-09a3-4da6-9e34-086e816f0839"></td>
        <td>${name}</td>
        <td>${rollNo}</td>
        <td>${dob}</td>
    </tr>` ;

    studentQueryResult.innerHTML += template ;
}

function renderTeacherData({serial,name,subject,dob}){
    let template = 
    `<tr data-id="${serial}">
        <td>${serial}</td>
        <td><img src="https://firebasestorage.googleapis.com/v0/b/student-details-manager.appspot.com/o/profile.png?alt=media&token=6ad1a772-09a3-4da6-9e34-086e816f0839"></td>
        <td>${name}</td>
        <td>${subject}</td>
        <td>${dob}</td>
    </tr>` ;

    teacherQueryResult.innerHTML += template ;
}

function addStudent(){
    let name = newStudentName.value.toLowerCase() || "" ;
    let dob = newStudentDob.value.toLowerCase() || "" ;
    let roll = newStudentRollNo.value.toLowerCase() || "" ;
    let enroll = newStudentEnrollNo.value.toLowerCase() || "" ;
    let department = newStudentDepartment.value.toLowerCase() || "" ;
    let sem = newStudentSemester.value.toLowerCase() || "" ;
    let year = newStudentYear.value.toLowerCase() || "" ;
    let email = newStudentEmail.value.toLowerCase() || "" ;
    let phone = newStudentPhone.value.toLowerCase() || "" ;
    let gender = newStudentGender.value.toLowerCase() || "" ;


    console.log(name,roll,enroll,phone,email,gender,department,sem,dob,year);

    if(enroll !== "" && enroll.length === 6) {
        console.log("valid");
        database.addStudent(name,roll,enroll,phone,email,gender,department,sem,dob,year);

        newStudentName.value = "" ;
        newStudentDob.value = "" ;
        newStudentRollNo.value = "" ;
        newStudentEnrollNo.value = "" ;
        newStudentDepartment.selectedIndex = 0 ;
        newStudentSemester.selectedIndex = 0 ;
        newStudentYear.selectedIndex = 0 ;
        newStudentEmail.value = "" ;
        newStudentPhone.value = "" ;
        newStudentGender.value = "" ;
    }
}

function editStudent(){

    appPageManager.show(addStudentPage) ;

    database.getStudent(editBtn.getAttribute("data-id"),(student) => {
        newStudentName.value = student.name ;
        newStudentDob.value = student.dob ;
        newStudentRollNo.value = student.rollNumber ;
        newStudentEnrollNo.value = student.enrollmentNumber ;
        newStudentDepartment.value = student.department ;
        newStudentSemester.value = student.semester ;
        newStudentYear.value = student.year ;
        newStudentEmail.value = student.email ;
        newStudentPhone.value = student.mobile ;
        newStudentGender.value = student.gender ;
    })

}