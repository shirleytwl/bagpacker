import React from 'react';
import PropTypes from 'prop-types';
import ActivitiesForm from "../packlist-activities-form";
import mainStyles from "../../../style.scss";
import {Col, Form, Row} from 'react-bootstrap';
import Countries from "../../../countries.js";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';


class PacklistForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			formInputs: {
				location: "",
				startDate:new Date(),
				endDate:new Date(),
				weather: "1",
				activities: [],
				group: []
			},
            allCountries:[],
            filteredCountries:[],
			errorMessage: "",
			groupPax: 1,
			loading: false
		};
	}

    componentDidMount(){
        for (let key in Countries){
            this.state.allCountries.push(key);
        }
        this.setState({allCountries:this.state.allCountries});
    }


	updateLocation = (e) => {
		let formInputs = this.state.formInputs;
		formInputs.location = e.target.value;
        if(e.target.value.length>0){
            this.state.filteredCountries = this.state.allCountries.filter(x=>{
                return x.toLowerCase().startsWith(e.target.value.toLowerCase())
            });

        }else{
            this.state.filteredCountries = [];
        }

        this.setState({formInputs: formInputs,filteredCountries:this.state.filteredCountries});

	};

	updateStartDate = (date) => {
		let formInputs = this.state.formInputs;
		formInputs.startDate = date;
		this.setState({formInputs: formInputs});
	};
	updateEndDate = (date) => {
		let formInputs = this.state.formInputs;
		formInputs.endDate = date;
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
						if (groupPax-1 != formInputs[item].length) {
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
			formInputs.duration = this.calcDuration(formInputs.startDate, formInputs.endDate);
			console.log(formInputs.duration);
			if (formInputs.duration <=0) {
				this.setState({errorMessage: "The start date cannot be later than the end date"});
			}
			else{
				this.setState({
					errorMessage: "",
					loading: true
				});
				let image_src = null;
				let url = 'https://api.teleport.org/api/cities/?search=' + formInputs.location.toLowerCase();

				fetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})
					.then(res => res.json())
					.then(res => {
						fetch(res["_embedded"]["city:search-results"][0]["_links"]["city:item"]["href"], {
							method: 'GET',
							headers: {
								'Content-Type': 'application/json'
							}
						})
							.then(res => res.json())
							.then(res => {
								fetch(res["_links"]["city:urban_area"]["href"], {
									method: 'GET',
									headers: {
										'Content-Type': 'application/json'
									}
								})
									.then(res => res.json())
									.then(res => {
										fetch(res["_links"]["ua:images"]["href"], {
											method: 'GET',
											headers: {
												'Content-Type': 'application/json'
											}
										})
											.then(res => res.json())
											.then(res => {
												image_src = res["photos"][0]["image"]["mobile"];
												formInputs["image"] = image_src;
												this.createTrip(formInputs);
											})
											.catch(error => {
												console.error("NO IMAGE");
												formInputs["image"] = "#";
												this.createTrip(formInputs);

											});
									})
									.catch(error => {
										console.error("NO IMAGE");
										formInputs["image"] = "#";
										this.createTrip(formInputs);

									});
							})
							.catch(error => {
								console.error("NO IMAGE");
								formInputs["image"] = "#";
								this.createTrip(formInputs);

							});

					})
					.catch(error => {
						console.error("NO IMAGE");
						formInputs["image"] = "#";
						this.createTrip(formInputs);

					});
			}
		}else {
			this.setState({errorMessage: "Please fill in the details to create trip"})
		}
	};
	createTrip = (data) => {
		fetch('/trips', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		})
        .then(res => res.json())
		.then(res => {
            let url = "/trips/"+res;
            this.props.history.push(url);
		})
		.catch(error => console.error('Error:', error));
	};
	calcDuration = (start, end) => {
		let duration = Math.floor((new Date(end).setHours(0,0,0,0)-new Date(start).setHours(0,0,0,0)) / (1000*60*60*24));
		return duration+1
	};

	render() {
        let datalistOptions = this.state.filteredCountries.map(x=><option>{x}</option>);
		let groupInputs = [];
		if (this.state.groupPax > 1) {
			groupInputs.push(<label>Trip Mates</label>);
			for (let i=0;i<this.state.groupPax-1; i++){
				groupInputs.push(
					<Form.Group key={i}>
						<Form.Control type="email" value={this.state.formInputs.group[i]} onChange={(e)=>{this.updateTripmate(e,i)}}/>
					</Form.Group>
				)
			}
		}
		let loadingScreen = null;
		console.log(this.state.loading);
		if (this.state.loading) {
			loadingScreen = (
				<div className={mainStyles.loadingScreen}>
					<div className={mainStyles.loader}>
						<div className={mainStyles.spinner}>
							<div className={mainStyles.loaderBubble1}></div>
							<div className={mainStyles.loaderBubble2}></div>
						</div>
					</div>
				</div>
			)
		}
		let errorMessage = null;
		if (this.state.errorMessage !== ""){
			errorMessage = (<Col xs={12} className={mainStyles.formError}><p>{this.state.errorMessage}</p></Col>);
		}
		return (
			<Form className={mainStyles.packlistModalForm}>
				<Row>
					<Col>
						<Form.Group>
							<Form.Label>Location</Form.Label>
							<Form.Control list="country-list" placeholder="Location" value={this.state.formInputs.location} onChange={this.updateLocation} />
							<datalist id="country-list">{datalistOptions} </datalist>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group className={mainStyles.datepicker}>
							<label>Start Date</label>
							<DatePicker
								selectsStart
								selected={this.state.formInputs.startDate}
								onChange={date => this.updateStartDate(date)}
								startDate={this.state.formInputs.startDate}
								endDate={this.state.formInputs.endDate}
								dateFormat='d MMM yyyy'
							/>
						</Form.Group>
					</Col>

					<Col>
						<Form.Group className={mainStyles.datepicker}>
							<label>End Date</label>
							<DatePicker
								selectsEnd
								selected={this.state.formInputs.endDate}
								onChange={date => this.updateEndDate(date)}
								endDate={this.state.formInputs.endDate}
								minDate={this.state.formInputs.startDate}
								dateFormat='d MMM yyyy'
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group>
							<label>Number of people</label>
							<Form.Control type="number" value={this.state.groupPax} min="1" max="10" onChange={this.updateGroupPax}/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						{groupInputs}
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group>
							<label>Weather</label><br/>
							<select value={this.state.formInputs.weather} onChange={this.updateWeather}>
								<option value="1">Sunny</option>
								<option value="2">Snowy</option>
								<option value="3">Rainy</option>
							</select>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						<div className={mainStyles.multiSelectWrapper}>
							<label>Activities</label>
							<ActivitiesForm updateActivities={this.updateActivities}/>
						</div>
					</Col>
				</Row>
				<Row>
					<Col xs={12} className="mb-5">
						<button type="submit" onClick={this.submit} className={mainStyles.btn}>Create Packing List</button>
					</Col>
					{errorMessage}
				</Row>
				{loadingScreen}
			</Form>
		);
	}
}

PacklistForm.propTypes ={
	history: PropTypes.object
};
export default PacklistForm;