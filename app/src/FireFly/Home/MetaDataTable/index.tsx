import {FC, useContext, useEffect, useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';

import {gridstyle, elementStyle, Props} from '../../Common/styles';
import {changeColor, changeBackground} from '../../Common/button';
import {Status, SERVER} from '../../Common/types';
import {DataProvider} from '../DataProvider';

const area = {
    closeButton: 'closeButton',
    confirm: 'confirm',
    error: 'error',
    location: 'location',
    locationVal: 'locationVal',
    date: 'date',
    dateVal: 'dateVal',
    severity: 'severity',
    severityVal: 'severityVal',
    status: 'status',
    statusVal: 'statusVal',
    setStatusModal: 'setStatusModal',
    photos: 'photos',
}

const MDTable:React.CSSProperties = {
    ...gridstyle,
    borderRight: '7px solid black',
    borderRadius: '25px',
    paddingRight: '3%',
    paddingLeft: '3%',
    gridTemplate: `
    " .                ${area.closeButton}     ${area.closeButton} " 0.10fr
    " ${area.location} ${area.locationVal}     ${area.locationVal} " 0.10fr
    " ${area.date}     ${area.dateVal}         ${area.dateVal}     " 0.10fr
    " ${area.status}   ${area.statusVal}       ${area.statusVal}   " 0.10fr
    " .                ${area.setStatusModal}  ${area.confirm}     " 40px
    " .                .                       ${area.error}       " 40px
    " ${area.photos}   ${area.photos}          ${area.photos}      " auto
    / auto             0.5fr                   0.5fr             `
}

const textStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
    fontFamily: 'Golos Text, sans-serif',
    minHeight: 0,
    minWidth: 0,
}

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    fontSize: '1.75em',
    fontWeight: 'bold',
}

interface MetaDataInfo {
    location: string,
    date: string,
    status:Status,
    rgbPhoto: string | null,
    maskedRGB: string | null,
    irPhoto:string | null
}

const defaultInfo:MetaDataInfo = {
    location: "",
    date: "",
    status: Status.Undefined,
    rgbPhoto: null,
    maskedRGB: null,
    irPhoto: null,
}

export const MetaDataTable:FC<Props> = ({style}) => {

    // States & hooks for setting the metadata information based on selected hotspot
    const {setNoMetaData, hotSpot} = useContext(DataProvider);
    const [metaDataInfo, setMetaDataInfo] = useState<MetaDataInfo>(defaultInfo)
    const [ismaskedRGB, showmaskedRGB] = useState<boolean>(false);
    const [statusFormVal, setstatusFormVal] = useState<Status>(Status.Undefined)
    const [error, setError] = useState<string>("");
    const [toggleText, setToggleText] = useState<string>("Show Detection Overlay");

    // If componenent is triggered to rerender & hotspot has changed update the metadata table information
    useEffect(() => {
        if (hotSpot !== null) {
            const newMetaData:MetaDataInfo = {
                date: hotSpot.date,
                location: `${hotSpot.lat.toFixed(4)}°, ${hotSpot.lng.toFixed(4)}°`,
                status: hotSpot.status,
                rgbPhoto: `${SERVER}${hotSpot.rgb_image_url}`,
                irPhoto: `${SERVER}${hotSpot.ir_image_url}`,
                maskedRGB: `${SERVER}${hotSpot.masked_image_url}`,
            }
            setMetaDataInfo(newMetaData);
        } else {
            setMetaDataInfo(defaultInfo);
        }
    }, [hotSpot])

    // Change status form value so when we submit it is correct
    const changeStatus = (e: any) => {
        setstatusFormVal(e.target.value);
        setError("");
    }

    // Update the status in the metadata table & do post request to database
    const submitStatus = () => {
        const setHotSpotStatus = async () => {
            const id = hotSpot !== null ? hotSpot.record_id : -1;
            const endpoint = `${SERVER}/api/server/records/${id}/update_status/`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "status" : statusFormVal,
                })
            })
            return res;
        }

        setHotSpotStatus()
        .then((res) => {
            if (res.ok) {
                setMetaDataInfo({
                    ...metaDataInfo,
                    status: statusFormVal
                })
                setError("");
            } else {
                setError("Error: Could not change status")
            }
        })
        .catch(() => {
            setError("Error: Could not change status")
        })
    }

    const handleToggle = () => {
        if (ismaskedRGB) {
            setToggleText("Show Detection Overlay");
            showmaskedRGB(false);
        } else {
            setToggleText("Show raw RGB");
            showmaskedRGB(true);
        }
    }

    return (
        <div
            style={{
                ...style,
                ...MDTable
            }}
        >
            <div
                style={{
                    gridArea: area.closeButton,
                    display: 'flex',
                    justifyContent: 'end',
                    alignContent: 'center',
                    padding: '5px',
                    paddingTop: '10px'
                }}
            >
                <button style={{
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    color: '#b8b7ad',
                    cursor: 'pointer'
                }} 
                onClick={() => setNoMetaData(true)} 
                onMouseEnter={e => changeColor(e, 'white')} 
                onMouseLeave={e => changeColor(e, '#b8b7ad')}
                >
                    <CloseIcon/>
                </button>
            </div>
            <h2 style={{gridArea: area.location, ...headerStyle}}>
                {"Geolocation: "}
            </h2>

            <h3 style={{gridArea: area.locationVal, ...textStyle}}
            >
                {metaDataInfo.location}
            </h3>

            <h2 style={{gridArea: area.date, ...headerStyle}}>
                {"Date: "}
            </h2>

            <h3 style={{gridArea: area.dateVal, ...textStyle}}>
                {metaDataInfo.date}
            </h3>
            
            <h2 style={{gridArea: area.status, ...headerStyle}}>
                {"Status: "}
            </h2>

            <h3 style={{gridArea: area.statusVal, ...textStyle}}>
                {metaDataInfo.status}
            </h3>

            <div
                style={{
                    gridArea: area.setStatusModal,
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'center',
                    minHeight: 0,
                    minWidth: 0,
                }}
            >
                <select 
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'rgb(49,52,55)',
                        border: 'none',
                        borderRadius: '45px',
                        margin: 4,
                        textAlign: 'center',
                        fontSize: 'medium',
                        color: '#b8b7ad',
                        cursor: 'pointer',
                        boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)'
                    }}
                    onChange={changeStatus}
                    onMouseEnter={e => changeColor(e, 'white')} 
                    onMouseLeave={e => changeColor(e, '#b8b7ad')}
                >
                    <option value={Status.Undefined}> Select Status </option>
                    <option value={Status.NotViewed}> {Status.NotViewed} </option>
                    <option value={Status.Viewed}> {Status.Viewed} </option>
                    <option value={Status.Dismissed}> {Status.Dismissed} </option>
                    <option value={Status.Visited}> {Status.Visited} </option>
                </select>
            </div>
            <div
                style={{
                    gridArea: area.confirm,
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'center',
                    minHeight: 0,
                    minWidth: 0,
                }}
            >
                <button 
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'rgb(49,52,55)',
                        border: 0,
                        borderRadius: '45px',
                        fontSize: 'medium',
                        margin: 4,
                        color: '#b8b7ad',
                        cursor: 'pointer'
                    }}
                    onClick={submitStatus}
                    onMouseEnter={e => changeBackground(e, 'rgb(40,122,44,1)')} 
                    onMouseLeave={e => changeBackground(e, 'rgb(49,52,55)')}
                >
                    {"Submit"}
                </button>
            </div>
            
            <text style={{
                gridArea: area.error,
                color: 'red',
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                }}
            >
                {error}
            </text>
            <div
                style={{
                    gridArea:area.photos,
                }}
            >
                <h2 style={{
                    marginBlockEnd: '0px',
                    ...headerStyle
                }}>
                    RGB Photo:
                </h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px',
                    boxSizing: 'border-box',
                    height: '30px'
                }}
                >
                    {hotSpot?.is_hotspot &&
                        <button style={{
                            marginLeft: 'auto',
                            marginRight: '10px',
                            background: 'rgb(49,52,55)',
                            height: '100%',
                            width: 'auto',
                            fontSize: 'medium',
                            textAlign: 'center',
                            border: 0,
                            borderRadius: '45px',
                            color: '#b8b7ad',
                            cursor: 'pointer',
                            minHeight: 0,
                            minWidth: 0,
                        }}
                        onClick={handleToggle}
                        >
                            {toggleText}
                        </button>
                    }
                </div>
                <div 
                    style={{
                    ...elementStyle
                    }}
                >
                    {(metaDataInfo.rgbPhoto !== null && metaDataInfo.maskedRGB !== null) &&
                        <img 
                            style={{
                                width: '75%',
                                height: '75%',
                            }} 
                            src={ismaskedRGB ? metaDataInfo.maskedRGB : metaDataInfo.rgbPhoto} alt=''
                        />
                    }
                </div>
                <h2 style={{...headerStyle}}>IR Photo:</h2>
                <div 
                    style={{
                    ...elementStyle,
                    }}
                >
                    {metaDataInfo.irPhoto !== null &&
                        <img 
                            style={{
                                width: '75%',
                                height: '75%',
                            }} 
                            src={metaDataInfo.irPhoto} alt=''
                        />
                    }
                </div>
            </div>
        </div>
    )
}