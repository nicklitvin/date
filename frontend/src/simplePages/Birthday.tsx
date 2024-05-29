import { useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { birthdayText } from "../text"
import { differenceInCalendarYears } from "date-fns"
import DatePicker from "react-native-date-picker"
import { MyButton } from "../components/Button"
import { getBirthdayStamp } from "../utils"
import { globals } from "../globals"
import { showToast } from "../components/Toast"

interface Props {
    submitText: string
    onSubmit: (input : Date) => any
    customBirthday?: Date
    goBack?: () => any
}

export function Birthday(props : Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [birthday, setBirthday] = useState<Date>(
        props.customBirthday ?? new Date(2000,0,1)
    );

    const processDate = (date : Date) => {
        setOpen(false);
        setBirthday(date);
    }

    const submitDate = () => {
        if (differenceInCalendarYears(new Date(), birthday) < globals.minAge) {
            return showToast("Error", birthdayText.tooYoung);
        }
        if (props.onSubmit) props.onSubmit(birthday);
    }

    return <MySimplePage
        title={birthdayText.pageTitle}
        subtitle={birthdayText.pageSubtitle}
        goBackFunc={props.goBack}
        beforeGapContent={
            <>
                <DatePicker     
                    modal mode="date" date={birthday} open={open}
                    onConfirm={processDate} onCancel={() => setOpen(false)}
                />
                <MyButton
                    text={getBirthdayStamp(birthday)}
                    onPressFunction={() => setOpen(true)}
                    invertColor={true}
                />
            </>
        }
        content={
            <>
                <MyButton
                    text={props.submitText}
                    onPressFunction={submitDate}
                />
            </>
        }
    />
}