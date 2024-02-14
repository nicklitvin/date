import React, { useEffect, useState } from 'react';
import DatePicker from 'react-native-date-picker'
import { StyledText } from '../styledElements';
import { differenceInCalendarYears } from 'date-fns';
import classNames from 'classnames';
import { MyButton } from './Button';
import { myText } from '../text';

interface Props {
    saveDate: (date : Date) => void
    afterSubmit: Function,
    customDate?: Date
}

// Can change to normal text input with validation
export function MyDateInput(props: Props) {
    const [date, setDate] = useState<Date>(props.customDate ?? new Date(2000,0,1));
    const [showError, setShowError] = useState<boolean>(false);

    useEffect( () => {
        if (differenceInCalendarYears(new Date(), date) < 18) {
            setShowError(true);
        }
    }, [date, showError])

    return (
        <>
            <DatePicker date={date} onDateChange={setDate}/>
            <StyledText className={classNames(
                showError ? "block" : "hidden"
            )}>
                {myText.birthdayInputError}
            </StyledText>
            <MyButton
                text={myText.continue}
                onPressFunction={() => {
                    if (!showError) {
                        props.saveDate(date);
                        props.afterSubmit();
                    } 
                }}
            />
        </>
    )
}