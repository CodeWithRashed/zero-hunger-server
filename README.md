# Zero Hunger

#### Zero Hunger is a food donation website. You can donate or request food for people. (This is the backend repo)

[Client Side Repo](https://github.com/Porgramming-Hero-web-course/b8a11-client-side-CodeWithRashed)
<br>

[Live Project Link (Firebase)](https://zero-hunger-a4e14.web.app)
 <br>

[Live Project Link (Vercel)](https://zero-hunger-client-five.vercel.app)

## Project Features
- User data saved on database. 
- Update delivery status api added. 
- Food api available for all user. 
- Data protected with JWT auth.
- Data sorting in backend. 

## Tech Stack

- Express
- MongoDB
- Cores
- Axios

 ### Get All Foods
	 - https://zero-hunger-server.vercel.app/api/v1/user/get/foods

### Get Single Food (Protected With JWT | User have to login to see it)
	 https://zero-hunger-server.vercel.app/api/v1/user/get/food/654a47ebac65af22d30832ee


### Getting User Specific Foods (Protected With JWT | User have to login to see it)
#### If logged user try to fetch other user data he will get "Unauthorized Access"
	 https://zero-hunger-server.vercel.app/api/v1/user/get/foods?email=tools.rashed@gmail.com
