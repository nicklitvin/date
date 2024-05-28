import { useEffect, useState } from "react";
import { MySimplePage } from "../src/components/SimplePage";
import { useStore } from "../src/store/RootStore";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import { ViewAnnouncementInput, WithKey } from "../src/interfaces";
import { MyButton } from "../src/components/Button";
import Loading from "./Loading";
import { announcementText, generalText } from "../src/text";

interface Props {

}

export function Announcements(props : Props) {
    const { receivedData } = useStore()
    const [index, setIndex] = useState<number>(0);
    const [text, setText] = useState<string[]>([]);

    const viewAnnouncement = async () => {
        if (!receivedData.profile?.id || !receivedData.announcements) return

        const input : WithKey<ViewAnnouncementInput> = {
            key: receivedData.loginKey,
            announcementID: receivedData.announcements[index].id,
            userID: receivedData.profile.id
        }

        // no need to await
        sendRequest(URLs.viewAnnouncement, input);
        setIndex(index + 1);
    }

    useEffect( () => {
        if (!receivedData.announcements || index >= receivedData.announcements.length) {
            receivedData.setAnnouncements(null);
        }
    }, [index])

    useEffect( () => {
        if (receivedData.announcements) {
            setText(receivedData.announcements.map( _ => {
                const index = Math.floor(Math.random() * announcementText.length);
                return announcementText[index];
            }))
        }
    }, [receivedData.announcements])

    if (!receivedData.announcements || index >= receivedData.announcements.length) return <Loading/>
    return (
        <MySimplePage
            title={receivedData.announcements[index].title}
            subtitle={receivedData.announcements[index].message}
            content={
                <MyButton
                    text={index < text.length ? text[index] : generalText.continue}
                    onPressFunction={viewAnnouncement}
                />
            }
        />
    )
}