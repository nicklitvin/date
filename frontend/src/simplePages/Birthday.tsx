import { useEffect, useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { birthdayText } from "../text"
import { differenceInCalendarYears } from "date-fns"
import DatePicker from "react-native-date-picker"
import { StyledText, StyledView } from "../styledElements"
import classNames from "classnames"
import { MyButton } from "../components/Button"
import { getBirthdayStamp } from "../utils"

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
    const [showError, setShowError] = useState<boolean>(false);

    const processDate = (date : Date) => {
        setOpen(false);
        if (differenceInCalendarYears(new Date(), date) < 18) {
            setShowError(true);
        } else {
            setShowError(false);
        }
        setBirthday(date);
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
                <StyledText className={classNames(
                    "m-2 text-base",
                    showError ? "opacity-100" : "opacity-0"
                )}>
                    {birthdayText.inputError}
                </StyledText>
            </>
        }
        content={
            <>
                <MyButton
                    text={props.submitText}
                    onPressFunction={() => {
                        if (!showError) {
                            props.onSubmit(birthday);
                        } 
                    }}
                />
            </>
        }
    />
}