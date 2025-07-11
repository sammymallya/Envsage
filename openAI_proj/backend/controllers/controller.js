const User = require('../models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { log } = require('node:console');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const fileUpdater = require('../controllers/user_data_store');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const passwordValidator = require('../validators/password_val');
const emailValidator = require('../validators/email_val');

exports.signup = async (req ,res ) =>{
    const {name , email , password,cpassword} = req.body;
    const passVal = passwordValidator(password,cpassword);
    if(!passVal){
        res.status(500).send("Passwords entered don't match! Try again");
        return;
    }
    if (emailValidator(email)&& name!='' && password!=''){
        //checking if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).send("user already exists");
        }
        const hashedPassword = await bcrypt.hash(password,10);    //so salt is 10 rounds here
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        console.log("User saved succesfully!");
        return res.status(201).send("User added succesfully!");
    }
    return res.status(400).send("Enter valid name,email and password!");
}
exports.login = async (req,res) => {
    try{
        const {email,password} = req.body;
        var storedUser = await User.findOne({email:email});

        if(!storedUser){
            return res.status(401).send("User not found");
        }
        var hashedStoredPassword = storedUser.password;
        bcrypt.compare(password,hashedStoredPassword,function(err,result){
            if(err){
                console.log("Error during login",err);
                return res.status(510).send("Error during login");
            }
            if(result){
                // console.log("Passwords match");
                // var signedToken = tokenSigner(storedUser,jwtSecretKey);
                return res.status(200).json({
                    message: "Login Succesful",
                    token: "Hi"//signedToken
                });
            }else{
                console.log("Passwords don't match");
                return res.status(410).send("Credentials do not match. Try again!");
            }
        })
        
    }catch(err){
        console.log("Error occurred: ".err);
        return res.status(400).send("Error occurred while logging in");
    }
}

exports.submitProfile = async (req,res) =>{
    console.log("\n Data sent for processing \n");
    const data = req.body;
    const prompt = `
        You are a highly experienced and professional career guidance counselor with a deep understanding of educational backgrounds, job markets, personality profiling, and upskilling strategies.

        A user is seeking tailored, well-rounded, and insightful career guidance. Based on their details below, provide an in-depth analysis and career path suggestions.

        ---

        ### User Profile:
        - **Name**: ${data.name}
        - **Age**: ${data.age}
        - **Gender**: ${data.gender}
        - **Location**: ${data.location}
        - **Current Education**: ${data.education}
        - **Future Education Plans**: ${data.future_education}
        - **Technical Skills**: ${data.skills}
        - **Hobbies**: ${data.hobbies}
        - **Interests**: ${data.interests}
        - **Personality Description**: ${data.personality}
        - **Career Goals**: ${data.goals}

        ---

        ### Please respond with the following sections in a json object (for eg:{"summary":"summary section content", "strengths":"strengths section content"}):
        1. **Summary of User Profile**: Brief overview of the user's background and aspirations.
        2. **Strengths and Strong Areas**: Based on education, skills, and personality.
        3. **Weaknesses and Areas for Improvement**: Suggest improvements or upskilling.
        4. **Best Skills to Learn Next**: Based on current interests, future goals, and industry trends.
        5. **Recommended Career Domains**: Mention 2–4 suitable domains with reasoning.
        6. **Job Role Suggestions**: Specific job roles (with titles) in each domain.
        7. **Good Colleges or Courses**: Suggest institutions or platforms for further studies (Bachelors, Masters, PhD, or certifications).
        8. **Short-term Plan **: Skills, internships, or certifications to pursue now.(in a span of next 1 year)
        9. **Long-term Plan **: Job progression, higher studies, or specialization routes.(2–5 years)
        10. **Final Advice**: Motivational or directional advice based on the user profile.

        Return only pure JSON. Do not use markdown symbols like ** or -. Use plain text and clear sentence structure instead of bullets.
        Respond only with a JSON object using the following exact keys:

        {
        "summary_of_user_profile": "",
        "strengths_and_strong_areas": "",
        "weaknesses_areas_for_improvement": "",
        "best_skills_to_learn_next": "",
        "recommended_career_domains": "",
        "job_role_suggestions": "",
        "good_colleges_or_courses": "",
        "short_term_plan": "",
        "short_term_plan_details": "",
        "long_term_plan": "",
        "long_term_plan_details": "",
        "final_advice": ""
        }

        Ensure that the field names match exactly. Do not rename or modify any keys.
        `;
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    });
    // window.location.href = "http://127.0.0.1:5504/openAI_proj/frontend/career_path.html"
    const rawText = response.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json\n?/, '').replace(/```$/, '');
    fileUpdater(cleanText);
    res.status(200).send(cleanText);
}


exports.fetchData = async (req,res)=> {
    const fs = require('fs');

    fs.readFile('/Users/sammy/Desktop/Coding/GitHub/Envsage/openAI_proj/backend/storage/data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    // console.log('File content:', data);
    res.status(200).send(data);
    });
}
