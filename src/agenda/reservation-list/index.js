import React, { Component } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';
import Reservation from './reservation';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import styleConstructor from './style';

class ReactComp extends Component {
    static propTypes = {
        // specify your item comparison function for increased performance
        rowHasChanged: PropTypes.func,
        // specify how each item should be rendered in agenda
        renderItem: PropTypes.func,
        // specify how each date should be rendered. day can be undefined if the item is not first in that day.
        renderDay: PropTypes.func,
        // specify how empty date content with no items should be rendered
        renderEmptyDate: PropTypes.func,
        // callback that gets called when day changes while scrolling agenda list
        onDayChange: PropTypes.func,
        // onScroll ListView event
        onScroll: PropTypes.func,
        // the list of items that have to be displayed in agenda. If you want to render item as empty date
        // the value of date key kas to be an empty array []. If there exists no value for date key it is
        // considered that the date in question is not yet loaded
        reservations: PropTypes.object,

        pressedDay: PropTypes.instanceOf(XDate),
        refreshControl: PropTypes.element,
        refreshing: PropTypes.bool,
        onRefresh: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.styles = styleConstructor(props.theme);

        this.state = {
            reservations: [],
            topDay: new XDate(new XDate(true).toString('yyyy-MM-dd'))
        };
        this.heights = [];
        this.scrollOver = true;
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
        this.viewabilityConfig = {
            itemVisiblePercentThreshold: 50
        };
    }

    onViewableItemsChanged(info) {
        if (!info) {
            return;
        }

        let { viewableItems } = info;

        if (!viewableItems) {
            return;
        }

        const day = viewableItems[0].item.day;

        if (this.state.scrollToPressed) {
            if (day === this.props.pressedDay) {
                this.setState({ scrollToPressed: false });
            }
        } else {
            this.props.onDayChange(day);
        }
    }

    componentWillReceiveProps(props) {
        if (!this.list) {
            return;
        }

        if (!props.pressedDay) {
            return;
        }

        const prevTime = this.props.pressedDay ? this.props.pressedDay.getTime() : 0;

        if (props.pressedDay.getTime() === prevTime) {
            return;
        }

        if (props.pressedDay.getTime() < this.state.topDay.getTime()) {
            this.setState({ topDay: props.pressedDay, scrollToPressed: true });
            setTimeout(() => {
                this.list.scrollToOffset({ animated: false, offset: 0 });
            }, 30);

            setTimeout(() => this.setState({ scrollToPressed: false }), 100);
        } else {
            this.setState({ topDay: props.pressedDay, scrollToPressed: true });

            setTimeout(() => {
                this.list.scrollToOffset({ animated: false, offset: 0 });
            }, 30);

            setTimeout(() => this.setState({ scrollToPressed: false }), 100);
        }
    }

    renderRow({ item }) {
        return (
            <View>
                <Reservation
                    item={item}
                    renderItem={this.props.renderItem}
                    renderDay={this.props.renderDay}
                    renderEmptyDate={this.props.renderEmptyDate}
                    theme={this.props.theme}
                    rowHasChanged={this.props.rowHasChanged}
                />
            </View>
        );
    }

    getReservationsList(props) {
        if (!props.reservations) {
            return [];
        }

        const dates = Object.keys(props.reservations).sort();
        const allReservations = [];
        const topDayStr = this.state.topDay.toString('yyyy-MM-dd');

        for (let i = 0; i < dates.length; i++) {
            const reservationsForDay = props.reservations[dates[i]];
            const dayStr = dates[i];

            const isBeforeTopDay = dayStr.localeCompare(topDayStr) < 0;

            if (isBeforeTopDay) {
                continue;
            }

            const day = new XDate(dayStr);
            if (reservationsForDay.length === 0) {
                allReservations.push({ reservation: undefined, date: day, day: day });
            }

            for (let j = 0; j < reservationsForDay.length; j++) {
                allReservations.push({ reservation: reservationsForDay[j], date: j === 0 ? day : undefined, day: day });
            }
        }

        return allReservations;
    }

    render() {
        if (!this.props.reservations) {
            if (this.props.renderEmptyData) {
                return this.props.renderEmptyData();
            }
            return <ActivityIndicator style={{ marginTop: 160 }} />;
        }

        const reservations = this.getReservationsList(this.props);

        return (
            <FlatList
                ref={c => (this.list = c)}
                style={this.props.style}
                contentContainerStyle={this.styles.content}
                renderItem={this.renderRow.bind(this)}
                data={reservations}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
                keyExtractor={item => (item.reservation ? item.reservation.entityId : item.day.toString())}
                refreshControl={this.props.refreshControl}
                refreshing={this.props.refreshing || false}
                onRefresh={this.props.onRefresh}
            />
        );
    }
}

export default ReactComp;
