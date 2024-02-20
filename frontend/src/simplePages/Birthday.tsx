import { useEffect, useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { birthdayText } from "../text"
import { differenceInCalendarYears } from "date-fns"
import DatePicker from "react-native-date-picker"
import { StyledText } from "../styledElements"
import classNames from "classnames"
import { MyButton } from "../components/Button"

interface Props {
    submitText: string
    onSubmit: (input : Date) => any
    customBirthday?: Date
}

export function Birthday(props : Props) {
    const [birthday, setBirthday] = useState<Date>(
        props.customBirthday ?? new Date(2000,0,1)
    );
    const [showError, setShowError] = useState<boolean>(false);

    useEffect( () => {
        if (differenceInCalendarYears(new Date(), birthday) < 18) {
            setShowError(true);
        }
    }, [birthday])

    return <MySimplePage
        title={birthdayText.pageTitle}
        subtitle={birthdayText.pageSubtitle}
        content={
            <>
                <DatePicker date={birthday} onDateChange={setBirthday}/>
                <StyledText className={classNames(
                    showError ? "block" : "hidden"
                )}>
                    {birthdayText.inputError}
                </StyledText>
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