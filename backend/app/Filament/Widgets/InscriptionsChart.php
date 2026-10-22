<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;

class InscriptionsChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected ?string $heading = 'Inscriptions au cours des six derniers mois';

    protected function getData(): array
    {
        $monthNames = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];
        $firstMonth = CarbonImmutable::now()->startOfMonth()->subMonths(5);
        $labels = [];
        $counts = [];

        for ($offset = 0; $offset < 6; $offset++) {
            $month = $firstMonth->addMonths($offset);
            $labels[] = $monthNames[$month->month].' '.$month->format('Y');
            $counts[] = User::query()
                ->whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Nouvelles inscriptions',
                    'data' => $counts,
                    'borderColor' => '#15803D',
                    'backgroundColor' => 'rgba(21, 128, 61, 0.15)',
                    'fill' => true,
                    'tension' => 0.35,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
