import { Title } from "../_components/Title";


const text = {
    title: "Terms of Service",
    content: 
`
These Terms of Service govern your use of Lovedu’s mobile application. By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.

1. Use of Services
You must be at least 18 years old to use our Services. By accessing or using our Services, you represent and warrant that you are at least 18 years old. You agree that you will not use our Services to publish, distribute, or engage in any activity that involves:

- Sexually explicit or pornographic content
- Content involving illegal activities or substances

We reserve the right to suspend your access to Lovedu’s services upon violation of this provision. 

2. User Accounts
You are required to create a user account to access Lovedu’s services using Apple or Google Sign In. You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account.

3. Privacy
Your profile information such as images and text will only be used to showcase your profile to other users of the app. Your activity such as swipes and messages will only be used for providing statistics to you (premium feature). Your data will not be used for advertising purposes. 

4. Liability
Lovedu is not responsible for any damages incurred by users of this platform. Use your best judgement when interacting with others and report any indecent behavior.

5. Changes to Terms
We reserve the right to update or modify these Terms at any time without prior notice. You will be notified of these changes and continuing to use the application will be an established agreement to follow these new guidelines.

6. Contact
To contact support at Lovedu, please send an email to quest.dev.supp@gmail.com
`
}

export default function Terms() {
    return (
        <div className="flex flex-col">
            <Title text={text.title}/> 
            <div className="h-2"/>
            <p className="text-sm whitespace-pre-wrap">{text.content}</p>
            <div className="h-5"/>
        </div>
    )
}