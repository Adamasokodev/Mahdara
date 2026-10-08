<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;

class InscriptionsChart extends ChartWidget
{
    protected ?string $heading = 'Inscriptions Chart';

    protected function getData(): array
    {
        return [
            //
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
