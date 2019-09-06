import React from 'react';
import PropTypes from 'prop-types';
import ActivitiesForm from "../packlist-activities-form";
import mainStyles from "../../../style.scss";
import {Form} from 'react-bootstrap';
import Category from "../../packlist/category";
import Countries from "./countries.js"

class PacklistForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			formInputs: {
				location: "",
				startDate: "",
				endDate: "",
				weather: "1",
				activities: [],
				group: []
			},
            locationInput:"",
            countryDropdown:[],
            allCountries:[],
			errorMessage: "",
			groupPax: 1
		};
	}

    componentDidMount(){
        for (let key in Countries){
            this.state.allCountries.push(key);
        }
        this.setState({allCountries:this.state.allCountries});
    }

    componentWillUnmount(){
        this.state.allCountries = [];
        this.setState({allCountries:this.state.allCountries});
    }

	updateLocation = (e) => {
		let formInputs = this.state.formInputs;
		formInputs.location = e.target.value;
        let locationInput = e.target.value;
        if(locationInput.length>0){
            console.log(locationInput.length)
            this.state.countryDropdown = this.state.allCountries.filter(x=>{
                return x.toLowerCase().startsWith(e.target.value.toLowerCase())
            });

        }else{
            this.state.countryDropdown = [];
        }

		this.setState({formInputs: formInputs, locationInput:locationInput,countryDropdown:this.state.countryDropdown});

	};

	updateStartDate = (e) => {
		let formInputs = this.state.formInputs;
		formInputs.startDate = e.target.value;
		this.setState({formInputs: formInputs});
	};
	updateEndDate = (e) => {
		let formInputs = this.state.formInputs;
		formInputs.endDate = e.target.value;
		this.setState({formInputs: formInputs});
	};

	updateGroupPax = (e) => {
		let formInputs = this.state.formInputs;
		let group = this.state.formInputs.group.slice(0, e.target.value);
		formInputs.group = group;
		this.setState({
			groupPax: parseInt(e.target.value),
			formInputs: formInputs
		});
	};
	updateWeather = (e) => {
		let formInputs = this.state.formInputs;
		formInputs.weather = e.target.value;
		this.setState({formInputs: formInputs});
	};

	updateActivities = (params) => {
		let formInputs = this.state.formInputs;
		formInputs.activities = params;
		this.setState({formInputs: formInputs});
	};
	updateTripmate = (e,index) => {
		let formInputs = this.state.formInputs;
		formInputs.group[index] = e.target.value;
		this.setState({formInputs: formInputs});
	};
	submit = (e) => {
		e.preventDefault();
		let formInputs = this.state.formInputs;
		let validated = true;
		let groupPax = this.state.groupPax;
		Object.keys(formInputs).forEach(function (item) {
			if (item !== "activities") {
				if (item === "group") {
					if (groupPax > 1) {
						if (groupPax != formInputs[item].length) {
							validated = false;
						} else {
							formInputs[item].forEach(function (email) {
								if (email.trim() === "")
									validated = false;
							})
						}
					}
				}
				else {
					if (formInputs[item] === "")
						validated = false;
				}
			}
		});
		if (validated) {
			formInputs["duration"] = this.calcDuration(formInputs["startDate"], formInputs["endDate"]);
			this.createTrip(formInputs);
		}
	};
	createTrip = (data) => {
		fetch('/trips', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => res.json())
			.then(res => {
                let url = "/trips/"+res
                this.props.history.push(url)
			})
			.catch(error => console.error('Error:', error));
	};
	calcDuration = (start, end) => {
		let duration = (new Date(end).getTime() - new Date(start).getTime());
		duration = Math.ceil(duration / (1000 * 60 * 60 * 24));
		return duration + 1;
	};

    pushToInput = (e) => {
        let formInputs = this.state.formInputs;
        formInputs.location = e.target.innerText;
        let locationInput = e.target.innerText;
        let countryDropdown = [];
        this.setState({formInputs: formInputs, locationInput:locationInput,countryDropdown:countryDropdown});
    }


	render() {
        console.log(this.state.countryDropdown)
        let countryDropdownContainer = <div>{this.state.countryDropdown.map(x=><div onClick={this.pushToInput}>{x}</div>)}</div>;
		let groupInputs = [];
		if (this.state.groupPax > 1) {
			groupInputs.push(<label>Trip Mates</label>);
			for (let i=0;i<this.state.groupPax; i++){
				groupInputs.push(
					<Form.Group key={i}>
						<Form.Control type="email" value={this.state.formInputs.group[i]} onChange={(e)=>{this.updateTripmate(e,i)}}/>
					</Form.Group>
				)
			}
		}
		return (
			<Form className={mainStyles.packlistForm}>
				<Form.Group>
					<Form.Label>Location</Form.Label>
					<Form.Control type="text" placeholder="Location" value={this.state.formInputs.location} onChange={this.updateLocation} />
                    {countryDropdownContainer}
				</Form.Group>

				<Form.Group>
					<label>Start Date</label>
					<Form.Control type="date" value={this.state.formInputs.startDate} onChange={this.updateStartDate}/>
				</Form.Group>

				<Form.Group>
					<label>End Date</label>
					<Form.Control type="date" value={this.state.formInputs.endDate} onChange={this.updateEndDate}/>
				</Form.Group>

				<Form.Group>
					<label>Number of people</label>
					<Form.Control type="number" value={this.state.groupPax} min="1" max="10" onChange={this.updateGroupPax}/>
				</Form.Group>

				{groupInputs}

				<Form.Group>
					<label>Weather</label>
					<select value={this.state.formInputs.weather} onChange={this.updateWeather}>
						<option value="1">Sunny</option>
						<option value="2">Snowy</option>
						<option value="3">Rainy</option>
					</select>
				</Form.Group>
				<div className={mainStyles.multiSelectWrapper}>
					<ActivitiesForm updateActivities={this.updateActivities}/>
				</div>
				<button type="submit" onClick={this.submit} className={mainStyles.btn}>Create Packing List</button>
				<br/>
				<div className="error">
				</div>
			</Form>
		);
	}
}

PacklistForm.propTypes ={
	updatePacklist: PropTypes.func,
	history: PropTypes.object
};
export default PacklistForm;