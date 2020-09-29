# Testing Pickleball Backend 

I used postman to test Pickleball Pal's endpoints by building a collection and environment variables to run tests.

The reason I used post man for this project is because tests are automated by creating test suites that can run again and again. Postman can be used to automate many types of tests including unit tests, functional tests, integration tests, end-to-end tests, regression tests, mock tests, etc. Automated testing prevents human error and streamlines testing.

Shifting to automated API tests means you’ll spend less money on QA, experience less lag time between development and QA, and spend less time debugging in production.


## How to Test my API 

If you don't have postman already, you can download the application [here](https://www.postman.com/downloads/)

1. You can directly down load the the '_tests' folder from this repo.
2. Once you download the Postman App, you can import both files by: 
	1. File: click on the **File** tab
	2. Import: Click on **Import...** 
	3. Upload: Upload the two JSON files from the '_tests' folder and click the **Import** button
3. Now you can run the collection by:
	1. Click on the **Runner** button or by clicking to **File** then click on **New Runner Window**
	2. Choose the **Pickleball Pal Backend Tests** collection
	3. Under Environment, choose the **Pickleball Pal Environment Variables**
	4. Click on the **Run Pickleball_Pal...** Button

Postman will then run each endpoint and test I created and there should be a total of 54 passing test and 0 fail.