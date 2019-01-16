import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { xdateToData } from '../../interface';
import XDate from 'xdate';
import dateutils from '../../dateutils';
import styleConstructor from './style';

class ReservationListItem extends Component {
    constructor(props) {
        super(props);
        this.styles = styleConstructor(props.theme);
    }

    renderDate(date, item) {
        if (this.props.renderDay) {
            return this.props.renderDay(date ? xdateToData(date) : undefined, item);
        }
        const today = dateutils.sameDate(date, XDate()) ? this.styles.today : undefined;
        if (date) {
            return (
                <View style={this.styles.day}>
                    <Text allowFontScaling={false} style={[this.styles.dayNum, today]}>
                        {date.getDate()}
                    </Text>
                    <Text allowFontScaling={false} style={[this.styles.dayText, today]}>
                        {XDate.locales[XDate.defaultLocale].dayNamesShort[date.getDay()]}
                    </Text>
                </View>
            );
        } else {
            return <View style={this.styles.day} />;
        }
    }

    render() {
        const { reservation, date } = this.props.item;
        let content;
        if (reservation) {
            const firstItem = date ? true : false;
            content = this.props.renderItem(reservation, firstItem);
        } else {
            content = this.props.renderEmptyDate(date);
        }
        return (
            <View style={this.styles.container}>
                {this.renderDate(date, reservation)}
                <View style={{ flex: 1 }}>{content}</View>
            </View>
        );
    }
}

export default ReservationListItem;
